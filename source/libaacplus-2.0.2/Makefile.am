
SUBDIRS = src include patches frontend

if HAVE_PKGCONFIG
    pkgconfigdir = $(libdir)/pkgconfig
    pkgconfig_DATA = aacplus.pc
else
    bin_SCRIPTS = aacplus-config
endif

EXTRA_DIST = autogen.sh aacplus.pc aacplus.spec

ACLOCAL_AMFLAGS = -I m4
