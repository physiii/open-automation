/*
 * aac_ram.h
 *
 *  Created on: 7 окт. 2010
 *      Author: tipok
 */

#ifndef AAC_RAM_H_
#define AAC_RAM_H_

#include <stdio.h>

typedef struct {
        /* Static memory areas, must not be overwritten in other sections of the encoder */
        /* aac Encoder mdct delay buffer */
        float mdctDelayBuffer[MAX_CHANNELS*BLOCK_SWITCHING_OFFSET];
        /* these tables are initialized once at application start
           and are not touched thereafter */
        int sideInfoTabLong[MAX_SFB_LONG + 1];
        int sideInfoTabShort[MAX_SFB_SHORT + 1];
        /* Dynamic memory areas, might be reused in other algorithm sections, */
        /* quantized spectrum */
        short *quantSpec;
        /* scratch space for quantization */
        float *expSpec; /* FRAME_LEN_LONG values */
        short *quantSpecTmp;
        /* scalefactors */
        short *scf; /*[MAX_CHANNELS*MAX_GROUPED_SFB];*/
        /* max spectral values pre sfb */
        unsigned short *maxValueInSfb; /* [MAX_CHANNELS*MAX_GROUPED_SFB]; */
} AACRam_t;

#endif /* AAC_RAM_H_ */
