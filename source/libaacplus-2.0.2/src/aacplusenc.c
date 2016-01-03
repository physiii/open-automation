/*
 * aacplusenc.c
 *
 *  Created on: 6 окт. 2010
 *      Author: tipok
 */

#include <stdlib.h>
#include <string.h>
#include <limits.h>

#ifdef HAVE_CONFIG_H
#include "config.h"
#endif

#include "aacplus.h"
#include "aacplusenc.h"

const int mpeg4audio_sample_rates[16] = {
    96000, 88200, 64000, 48000, 44100, 32000,
    24000, 22050, 16000, 12000, 11025, 8000, 7350
};

const uint8_t mpeg4audio_channels[8] = {
    0, 1, 2, 3, 4, 5, 6, 8
};
	    

int aacplusEncInitSBRAACRam(struct AAC_ENCODER *aacenc)
{
    SBRRam_t *sbr =  calloc(1, sizeof(SBRRam_t));
    AACRam_t *aac =  calloc(1, sizeof(AACRam_t));
    if(!sbr || !aac) return -1;

    sbr->PsBuf2= &aac->mdctDelayBuffer[BLOCK_SWITCHING_OFFSET];
    /* Overlay PsBuf4 and PsBuf5 with sbr_toncorrBuff of 2nd channel, since SBR only works in mono */
    sbr->PsBuf4 = &sbr->sbr_toncorrBuff[5*NO_OF_ESTIMATES*MAX_FREQ_COEFFS];
    sbr->PsBuf5 = &sbr->sbr_toncorrBuff[5*NO_OF_ESTIMATES*MAX_FREQ_COEFFS + PS_BUF4_SIZE];
    aacenc->sbr_ram = sbr;

    /* aac_ram.c */
    aac->quantSpec = (short*) sbr->PsBuf3;
    aac->expSpec = sbr->sbr_envIBuffer; /* FRAME_LEN_LONG values */
    aac->quantSpecTmp = (short*) &sbr->sbr_envIBuffer[FRAME_LEN_LONG];
    aac->scf= (short*) &sbr->sbr_envIBuffer[2*FRAME_LEN_LONG]; /*[MAX_CHANNELS*MAX_GROUPED_SFB];*/
    aac->maxValueInSfb = (unsigned short*) &sbr->sbr_envIBuffer[2*FRAME_LEN_LONG+MAX_CHANNELS*MAX_GROUPED_SFB]; /* [MAX_CHANNELS*MAX_GROUPED_SFB]; */

    aacenc->aac_ram = aac;
    return 1;
}

int aacplusEncFreeSBRAACRam(struct AAC_ENCODER *aacenc)
{
    free(aacenc->sbr_ram);
    free(aacenc->aac_ram);
    return 1;
}


aacplusEncHandle aacplusEncOpen(unsigned long sampleRate,
                  unsigned int numChannels,
                  unsigned long *inputSamples,
                  unsigned long *maxOutputBytes) {

    AACPContext *aacp = NULL;

    assert(numChannels <= MAX_CHANNELS);
    aacp = calloc(1, sizeof(AACPContext));
    if(!aacp)
        return aacp;

    /* set up basic parameters for aacPlus codec */
    AacInitDefaultConfig(&aacp->config);
    aacp->config.nChannelsIn = numChannels;
    aacp->config.sampleRate = sampleRate;
    aacp->writeOffset = INPUT_DELAY*MAX_CHANNELS;
    aacplusEncInitSBRAACRam(&aacp->aacEnc);
//#ifdef _FFTW3
    init_plans(&aacp->fftctx);
//#endif
    *inputSamples = AACENC_BLOCKSIZE*2 * numChannels;
    *maxOutputBytes = (6144/8)*MAX_CHANNELS+ADTS_HEADER_SIZE;
    return (aacplusEncHandle ) aacp;
}




aacplusEncConfiguration *aacplusEncGetCurrentConfiguration(aacplusEncHandle hEncoder)
{
    AACPContext *aacp = (AACPContext *) hEncoder;
    if(!aacp) return NULL;
    return &aacp->config;
}





int aacplusEncSetConfiguration(aacplusEncHandle hEncoder,
        aacplusEncConfiguration *cfg) {
    AACPContext *aacp = (AACPContext *) hEncoder;

    assert(cfg);
    if(cfg != &aacp->config)
    	memcpy(&aacp->config, cfg, sizeof(aacplusEncConfiguration));

    int sampleRateAAC = aacp->config.sampleRate;

    if(!aacp->config.nChannelsOut)
    	aacp->config.nChannelsOut = aacp->config.nChannelsIn;

    if(!aacp->config.bitRate)
    	return 0;

    if(aacp->config.bandWidth > aacp->config.sampleRate/2)
    	return 0;

    /* set input samples for not only 1024 framesize */
    aacp->config.inputSamples = aacp->config.nSamplesPerFrame * 2 * aacp->config.nChannelsIn;

    if ( (aacp->config.nChannelsOut == 2) && (aacp->config.bitRate >= 16000) && (aacp->config.bitRate < 44001) ) {
        aacp->config.nChannelsOut=1;
        aacp->useParametricStereo=1;

        aacp->envReadOffset = (MAX_DS_FILTER_DELAY + INPUT_DELAY)*MAX_CHANNELS;
        aacp->coreWriteOffset = CORE_INPUT_OFFSET_PS;
        aacp->writeOffset = aacp->envReadOffset;
    } else {
        /* set up 2:1 downsampling */
        InitIIR21_Resampler(&aacp->IIR21_reSampler[0]);
        InitIIR21_Resampler(&aacp->IIR21_reSampler[1]);

        assert(aacp->IIR21_reSampler[0].delay <= MAX_DS_FILTER_DELAY);
        aacp->writeOffset += aacp->IIR21_reSampler[0].delay*MAX_CHANNELS;
    }

    /* set up SBR configuration    */
    if(!IsSbrSettingAvail(aacp->config.bitRate, aacp->config.nChannelsOut, sampleRateAAC, &sampleRateAAC)) {
        fprintf(stderr, "libaacplus: bad aac setting: br:%d, AACch:%d, AACsr:%d\n",
                aacp->config.bitRate, aacp->config.nChannelsOut, sampleRateAAC);
        return 0;
    }

    InitializeSbrDefaults (&aacp->sbrConfig);
    aacp->sbrConfig.usePs = aacp->useParametricStereo;

    if(!AdjustSbrSettings( &aacp->sbrConfig, aacp->config.bitRate, aacp->config.nChannelsOut, sampleRateAAC, AACENC_TRANS_FAC, 24000)) {
        fprintf(stderr, "libaacplus: bad sbr setting: br:%d, AACch:%d, AACsr:%d PS:%d\n",
                aacp->config.bitRate, aacp->config.nChannelsOut, sampleRateAAC, aacp->sbrConfig.usePs);
        return 0;
    }

    if(EnvOpen(aacp->aacEnc.sbr_ram,
            &aacp->hEnvEnc,
            &aacp->inBuf[aacp->coreWriteOffset],
            &aacp->sbrConfig,
            &aacp->config.bandWidth) != 0){
        EnvClose (&aacp->hEnvEnc);
        fprintf(stderr, "libaacplus: can't open sbr encoder\n");
        return 0;
    }

//#ifdef _FFTW3
    aacp->hEnvEnc.fftctx = &aacp->fftctx;
//#endif
    /* set up AAC encoder, now that samling rate is known */
    aacp->config.sampleRate = sampleRateAAC;
    if (AacEncOpen( &aacp->aacEnc, &aacp->config) != 0){
        AacEncClose(&aacp->aacEnc);
        fprintf(stderr, "libaacplus: can't open aac encoder\n");
        return 0;
    }
//#ifdef _FFTW3
    aacp->aacEnc.fftctx = &aacp->fftctx;
//#endif
    /* create the ADTS header */
    if(cfg->outputFormat==1) {
        aacp->adts = calloc(1, sizeof(ADTSContext_t));
        if(!aacp->adts) {
            fprintf(stderr, "libaacplus: can't create adts context\n");
            return 0;
        }
        adts_hdr_init(aacp->adts, &aacp->config, &aacp->aacEnc.bitStream);
    }
    return 1;
}


int FindSRIndex(int sr)
{
    int i;
    for (i = 0; i < 16; i++) {
	if (sr == mpeg4audio_sample_rates[i])
	    return i;
    }
    return 16 - 1;
}

int FindCHIndex(int ch)
{
    int i;
    for (i = 0; i < 16; i++) {
	if (ch == mpeg4audio_channels[i])
	    return i;
    }
    return 16 - 1;
}


/*

object_type (AOT_AAC_LC) = || 0001 | 0
sr_idx (6 = 24000) = 011 || 0
chan_cfg (1 = 1) = 000 | 1
(specific_config_bitindex = 27 bits)
blablabla = 000
sync_extension = || 0101 | 0110 || 111

object_type (AOT_SBR) =  0 | 0101
have_new_sr? = || 1
sr_idx (3 = 48000) = 001 | 1

000 ||



///////////////////////////
PS:
101 || 0100 1000 || x... .... ||
7
*/


/* create extradata for aac+ */
#define AACPLUS_AOT_AAC_LC 2
#define AACPLUS_AOT_SBR 5
#define AACPLUS_LOAS_SYNC 0x2b7
#define AACPLUS_PS_EXT 0x548

int aacplusEncGetDecoderSpecificInfo(aacplusEncHandle hEncoder, unsigned char **ppBuffer,
                      unsigned long *pSizeOfDecoderSpecificInfo){
    AACPContext *aacp = (AACPContext *) hEncoder;
    int srate_idx, ch_idx;
    int window_size = 0;
    int loas_sync = AACPLUS_LOAS_SYNC;
    int ps_extension = 0;
    uint8_t *extradata = calloc(1, MAX_EXTRADATA_SIZE);
    if(!extradata)
    	return -3;

    if(aacp->useParametricStereo) 
    	ps_extension = AACPLUS_PS_EXT;

    srate_idx = FindSRIndex(aacp->config.sampleRate);
    ch_idx = FindCHIndex(aacp->config.nChannelsOut);
    if(aacp->config.nSamplesPerFrame != AACENC_BLOCKSIZE)
    	window_size = 1;
    extradata[0] = AACPLUS_AOT_AAC_LC << 3 | srate_idx >> 1;
    extradata[1] = srate_idx << 7 | ch_idx << 3 | window_size << 2;

    srate_idx = FindSRIndex(aacp->config.sampleRate * 2);

    extradata[2] = loas_sync >> 3; //sync extension
    extradata[3] = (loas_sync << 5) & 0xe0 | AACPLUS_AOT_SBR; //sync extension + sbr hdr
    extradata[4] = 1 << 7 | srate_idx << 3 | ps_extension >> 8;
    if(ps_extension) {
        extradata[5] = ps_extension & 0xff;
		extradata[6] = 1 << 7;
		*pSizeOfDecoderSpecificInfo = 7;
    } else {
		*pSizeOfDecoderSpecificInfo = 5;
    }

//    fprintf(stderr, "libaacplus: codec config(%d): %02x %02x %02x %02x %02x %02x %02x\n", *pSizeOfDecoderSpecificInfo,
//    extradata[0], extradata[1], extradata[2], extradata[3], extradata[4], extradata[5], extradata[6]);
    *ppBuffer = extradata;
    return 1;
}


int aacplusEncEncode(aacplusEncHandle hEncoder, int32_t *inputBuffer, unsigned int samplesInput,
             unsigned char *outputBuffer,
             unsigned int bufferSize) {
    AACPContext *aacp = (AACPContext *) hEncoder;
    unsigned int i;
    int ch, outSamples=0, numOutBytes = 0;
    int adts_offset = 0;

    assert(outputBuffer);

    if(samplesInput > aacp->config.inputSamples)
        return -1;

    switch (aacp->config.inputFormat){
        case AACPLUS_INPUT_16BIT: {
            int16_t *inbuff = (int16_t *) inputBuffer;
            for (i=0; i<samplesInput; i++)
                aacp->inBuf[(2/aacp->config.nChannelsIn)*i+aacp->writeOffset+aacp->writtenSamples] = (float) inbuff[i];
            break;
        }
        case AACPLUS_INPUT_FLOAT: {
            float *inbuff = (float *) inputBuffer;
            for (i=0; i<samplesInput; i++)
                aacp->inBuf[(2/aacp->config.nChannelsIn)*i+aacp->writeOffset+aacp->writtenSamples] = inbuff[i] * SHRT_MAX;
            break;
        }
	default:
            return -1;
            break;
    }

    /* Simple stereo to mono conversion: L = (L+R)/2 */
    if((aacp->config.nChannelsIn == 2) &&
       (aacp->config.nChannelsOut == 1) && !aacp->useParametricStereo) {
        for (i=0; i<samplesInput/2; i++)
            aacp->inBuf[i+aacp->writeOffset+aacp->writtenSamples] = (aacp->inBuf[i+aacp->writeOffset+aacp->writtenSamples]
                 + aacp->inBuf[i+aacp->writeOffset+aacp->writtenSamples+1])*0.5f;
    }

    aacp->writtenSamples+=samplesInput;

    if (aacp->writtenSamples < aacp->config.inputSamples)
        return 0;

    if(aacp->adts) adts_offset=ADTS_HEADER_SIZE;
    if (bufferSize < (6144/8)*MAX_CHANNELS+adts_offset)
        return -1;

    /* encode one SBR frame */
    EnvEncodeFrame( &aacp->hEnvEnc,
            &aacp->inBuf[aacp->envReadOffset],
            &aacp->inBuf[aacp->coreWriteOffset],
            MAX_CHANNELS,
            &aacp->numAncDataBytes,
            aacp->ancDataBytes);

    /* 2:1 downsampling for AAC core */
    if (!aacp->useParametricStereo)
        for( ch=0; ch<aacp->config.nChannelsIn; ch++ )
            IIR21_Downsample( &aacp->IIR21_reSampler[ch],
                    &aacp->inBuf[aacp->writeOffset+ch],
                    aacp->config.nSamplesPerFrame * 2, //aacp->writtenSamples,
                    MAX_CHANNELS,
                    &aacp->inBuf[ch],
                    &outSamples,
                    MAX_CHANNELS);

    AacEncEncode( &aacp->aacEnc,
                  aacp->inBuf,
                  aacp->useParametricStereo ? 1 : MAX_CHANNELS, /* stride (step) */
                  aacp->ancDataBytes,
                  &aacp->numAncDataBytes,
                  (unsigned *) (outputBuffer+adts_offset),
                  &numOutBytes);
    if (aacp->useParametricStereo) {
        memcpy( aacp->inBuf,&aacp->inBuf[aacp->config.nSamplesPerFrame],CORE_INPUT_OFFSET_PS*sizeof(float));
    } else {
        memmove( aacp->inBuf,&aacp->inBuf[aacp->config.nSamplesPerFrame*2*MAX_CHANNELS],
        		aacp->writeOffset*sizeof(float));
    }

    /* Write one frame of encoded audio */
    if(numOutBytes > 0 && aacp->adts) {
        adts_hdr_up(aacp->adts, outputBuffer, numOutBytes);
        numOutBytes+=adts_offset;
    }

    aacp->writtenSamples=0;
    return numOutBytes;
}


int aacplusEncClose(aacplusEncHandle hEncoder) {
    AACPContext *aacp = (AACPContext *) hEncoder;

    if(!aacp) return 0;

    AacEncClose(&aacp->aacEnc);
    EnvClose(&aacp->hEnvEnc);

//#ifdef _FFTW3
    destroy_plans(&aacp->fftctx);
//#endif

    aacplusEncFreeSBRAACRam(&aacp->aacEnc);
    if(aacp->adts)
        free(aacp->adts);

    free(aacp);
    return 1;
}
