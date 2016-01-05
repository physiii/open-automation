/*
  adts

  Original work by Matteo Croce
  Small changes and fixes by Rafael Diniz

  Copyright (C) Matteo Croce and Rafael Diniz
 */
#include <string.h>

#include "aacplusenc.h"

void adts_hdr_init(ADTSContext_t *ctx, aacplusEncConfiguration *config, HANDLE_BIT_BUF bitBuffer)
{
    ctx->adts_size = ADTS_HEADER_SIZE;
    int mpeg_id = ADTS_MPEG_ID;
    int profile = ADTS_MPEG_PROFILE;
    int srate_idx = FindSRIndex(config->sampleRate);

    ctx->bitBuffer = bitBuffer;
    /* adts use only 1024 samples window */
    assert(config->nSamplesPerFrame == AACENC_BLOCKSIZE);

    /* SOURCE: http://blog.olivierlanglois.net/index.php/2008/09/12/aac_adts_header_buffer_fullness_field */
    unsigned short min_dec_in_size = (6144*config->nChannelsOut);
    ctx->mean_framelength = (unsigned short)((float) config->bitRate/config->sampleRate*1024);
    ctx->max_bit_reservoir = min_dec_in_size - ctx->mean_framelength;
    ctx->frl_divider = 32*config->nChannelsOut;

    memset(ctx->const_hdr, 0, 4);
    ctx->const_hdr[0] = 0xFF; /* 8bits: syncword */
    ctx->const_hdr[1] = 0xF0; /* 4bits: syncword */
    ctx->const_hdr[1] |= mpeg_id << 3; /* 1bit:  mpeg id = 0 */
            /* 2bits: layer = 00 */
    ctx->const_hdr[1] |= 1;   /* 1bit:  protection absent (1 - means "no protection")*/
    ctx->const_hdr[2] = ((profile << 6) & 0xC0);      /* 2bits: profile */
    ctx->const_hdr[2] |= ((srate_idx << 2) & 0x3C);   /* 4b: sampling_frequency_index */
        /* 1b: private = 0 */
    ctx->const_hdr[2] |= ((config->nChannelsOut >> 2) & 0x1); /* 1b: channel_configuration */
    ctx->const_hdr[3] = ((config->nChannelsOut << 6) & 0xC0); /* 2b: channel_configuration */

}

void adts_hdr_up(ADTSContext_t *ctx, char *buff, int size)
{
    unsigned short len = size + ADTS_HEADER_SIZE;
    unsigned short buffer_fullness = 0x07FF;

    memcpy(buff, ctx->const_hdr, 4);

//#ifdef ENABLE_BIT_RESERVOIR
    ctx->bit_reservoir_state += ctx->mean_framelength - GetBitsAvail(ctx->bitBuffer);
    if (ctx->bit_reservoir_state < 0) {
    	ctx->bit_reservoir_state = 0;
    } else if (ctx->bit_reservoir_state > ctx->max_bit_reservoir) {
    	ctx->bit_reservoir_state = ctx->max_bit_reservoir;
    }
    buffer_fullness = ctx->bit_reservoir_state/ctx->frl_divider;
//#endif

    /* frame length, 13 bits */
    buff[3] &= 0xFC;
    buff[3] |= ((len >> 11) & 0x03);	/* 2b: aac_frame_length */
    buff[4] = len >> 3;			/* 8b: aac_frame_length */
    buff[5] = (len << 5) & 0xE0;	/* 3b: aac_frame_length */
    /* buffer fullness, 11 bits */
    buff[5] |= ((buffer_fullness >> 6) & 0x1F);	/* 5b: adts_buffer_fullness */
    buff[6] = (buffer_fullness << 2) & 0xFC;	/* 6b: adts_buffer_fullness */
						/* 2b: num_raw_data_blocks */
}
