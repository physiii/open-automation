/*
    adts

    Original work by Matteo Croce
    Small changes and fixes by Rafael Diniz

    Copyright (C) Matteo Croce and Rafael Diniz
 */
#ifndef adts_h_
#define adts_h_

#include <stdint.h>
#include "aacplusenc.h"

#define ADTS_HEADER_SIZE 7
#define ADTS_MPEG_ID 1 /* 0: MPEG-4, 1: MPEG-2 */
#define ADTS_MPEG_PROFILE 1

typedef struct {
        HANDLE_BIT_BUF bitBuffer;
        uint8_t const_hdr[4];
        int bit_reservoir_state;
        unsigned short  mean_framelength;
        unsigned short frl_divider;
        unsigned short max_bit_reservoir;
        int adts_size;
        int window_size;
} ADTSContext_t;

void adts_hdr_init(ADTSContext_t *ctx, aacplusEncConfiguration *config, HANDLE_BIT_BUF bitBuffer);
void adts_hdr_up(ADTSContext_t *ctx, char *buff, int size);

#endif
