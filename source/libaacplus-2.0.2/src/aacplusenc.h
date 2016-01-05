/*
 * aacplusenc.h
 *
 *  Created on: 7 окт. 2010
 *      Author: tipok
 */

#ifndef AACPLUSENC_H_
#define AACPLUSENC_H_

#ifdef HAVE_CONFIG_H
#include "config.h"
#endif


/*-------------------------- defines --------------------------------------*/
/* here we distinguish between stereo and the mono only encoder */
#ifdef MONO_ONLY
#define MAX_CHANNELS        1
#else
#define MAX_CHANNELS        2
#endif

#define AACENC_BLOCKSIZE    1024   /*! encoder only takes BLOCKSIZE samples at a time */
#define AACENC_TRANS_FAC    8      /*! encoder short long ratio */
#define AACENC_PCM_LEVEL    1.0    /*! encoder pcm 0db refernence */

#define MAX_EXTRADATA_SIZE 7 /* LC + SBR + PS config */
#define BUFFERSIZE 1024     /* anc data */

#include "aacplus.h"

#include "minmax.h"
#include "sbr_def.h"


#include "psy_const.h"
#include "cfftn.h"
#include "hybrid.h"
#include "sbr_ram.h"

#include "sbr_main.h"
#include "fram_gen.h"
#include "tran_det.h"
#include "code_env.h"

#include "qmf_enc.h"
#include "env_est.h"
#include "mh_det.h"
#include "nf_est.h"
#include "invf_est.h"
#include "ton_corr.h"


#include "tns.h"
#include "sbr.h"

#include "aac_ram.h"
#include "tns_param.h"
#include "aac_rom.h"

#include "dyn_bits.h"
#include "adj_thr_data.h"
#include "qc_data.h"
#include "block_switch.h"
#include "psy_data.h"
#include "interface.h"
#include "psy_configuration.h"
#include "psy_main.h"
#include "FFR_bitbuffer.h"
#include "bitenc.h"
#include "stprepro.h"
#include "aacenc.h"

#include "adj_thr.h"
#include "adts.h"
#include "band_nrg.h"
#include "bit_cnt.h"
#include "bit_sbr.h"
#include "channel_map.h"
#include "env_bit.h"
#include "FloatFR.h"
#include "freq_sca.h"
#include "grp_data.h"

#include "line_pe.h"
#include "ms_stereo.h"
#include "pre_echo_control.h"
#include "ps_bitenc.h"
#include "ps_enc.h"
#include "cmondata.h"

#include "qc_main.h"
#include "quantize.h"
#include "resampler.h"
#include "sbr_misc.h"
#include "sbr_rom.h"
#include "sf_estim.h"
#include "spreading.h"
#include "stat_bits.h"
#include "tns_func.h"
#include "transform.h"


struct SBR_ENCODER
{
  FFTWFContext_t            *fftctx;
  struct SBR_CONFIG_DATA    sbrConfigData;
  struct SBR_HEADER_DATA    sbrHeaderData;
  struct SBR_BITSTREAM_DATA sbrBitstreamData;
  struct ENV_CHANNEL*       hEnvChannel[MAX_CHANNELS];
  struct COMMON_DATA        CmonData;
  struct PS_ENC             *hPsEnc;
  SBR_QMF_FILTER_BANK       *hSynthesisQmfBank;
  unsigned int              sbrPayloadPrevious[MAX_PAYLOAD_SIZE/(sizeof(int))];
  unsigned int              sbrPayload[MAX_PAYLOAD_SIZE/(sizeof(int))];
  int                       sbrPayloadSize;
} ;


#define CORE_DELAY   (1600)
/* (96-64) makes AAC still some 64 core samples too early wrt SBR ... maybe -32 would be even more correct, but 1024-32 would need additional SBR bitstream delay by one frame */
#define CORE_INPUT_OFFSET_PS (0)
/* ((1600 (core codec)*2 (multi rate) + 6*64 (sbr dec delay) - 2048 (sbr enc delay) + magic*/
#define INPUT_DELAY  ((CORE_DELAY)*2 +6*64-(AACENC_BLOCKSIZE*2)+1)
/* the additional max resampler filter delay (source fs)*/
#define MAX_DS_FILTER_DELAY 16

typedef struct {
        /* adts stuff */
        ADTSContext_t *adts;

        /* AAC encoder instance for one encoder */
        aacplusEncConfiguration     config;
        struct AAC_ENCODER aacEnc;

        sbrConfiguration sbrConfig;
        struct SBR_ENCODER hEnvEnc;
        SBR_QMF_FILTER_BANK SynthesisQmfBank;
        struct PS_ENC psEncoder;

        /* 2x => 1x samplerate converter instance */
        IIR21_RESAMPLER IIR21_reSampler[MAX_CHANNELS];
//#ifdef _FFTW3
        FFTWFContext_t fftctx;
//#endif
        float inBuf[(AACENC_BLOCKSIZE*2 + MAX_DS_FILTER_DELAY + INPUT_DELAY)*MAX_CHANNELS];
        //char outBuf[(6144/8)*MAX_CHANNELS+ADTS_HEADER_SIZE];


        unsigned int numAncDataBytes;
        unsigned char ancDataBytes[MAX_PAYLOAD_SIZE];


        int useParametricStereo;
        unsigned int inSamples;
        unsigned int writtenSamples;
        unsigned int writeOffset;
        int envReadOffset;
        int coreWriteOffset;

} AACPContext;

int FindSRIndex(int sr);

#endif /* AACPLUSENC_H_ */
