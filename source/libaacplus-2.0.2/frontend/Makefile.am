bin_PROGRAMS = aacplusenc
man_MANS = ../docs/aacplusenc.1

aacplusenc_SOURCES = main.c

INCLUDES = -I$(top_srcdir)/include  -I$(top_srcdir)/src
LDADD = $(top_builddir)/src/libaacplus.la -lm

aacplusenc_LDFLAGS = @FFTW3_LDFLAGS@
