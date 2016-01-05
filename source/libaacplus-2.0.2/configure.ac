# -*- Autoconf -*-
# Process this file with autoconf to produce a configure script.

AC_INIT([libaacplus],[2.0.2],[Sergiy Guriev <piratfm@ua.fm>])
#AM_INIT_AUTOMAKE([dist-bzip2])
AM_INIT_AUTOMAKE

AM_CONFIG_HEADER(config.h)
AC_CONFIG_MACRO_DIR([m4])
# Checks for programs.
AC_PROG_CC
AM_PROG_CC_C_O
AC_PROG_CPP
AC_PROG_INSTALL
AC_PROG_LN_S
AC_PROG_MAKE_SET
AC_LIBTOOL_WIN32_DLL
AM_PROG_LIBTOOL
AC_PATH_PROG([UNZIP],[unzip])
if test x"$UNZIP" = x -a ! -f "aacenc.c" ; then
    AC_MSG_ERROR([You need unzip utility to prepare sources.])
fi
AC_PATH_PROG([PATCH],[patch])
if test x"$PATCH" = x -a ! -f "aacenc.c" ; then
    AC_MSG_ERROR([You need patch utility to prepare sources.])
fi
AC_PARAMETER_EXPANSION_STRING_REPLACE_CAPABLE_SHELL
if test x"$PARAMETER_EXPANSION_STRING_REPLACE_CAPABLE_SHELL" = x -a ! "(" -f"26410-800.zip" -o -f "aacenc.c" ")" ; then
dnl number sigh cannot be a part of AC_MSG_ERROR
    NUMBER_SIGN="#"
    AC_MSG_ERROR([You need parameter expansion string replace (i. e. \${var%string} and \${var${NUMBER_SIGN}string}) capable shell (bash, ash, better sh).])
fi
AC_CHECK_DOWNLOADER_PROG
if test x"$DOWNLOADER_PROG" = x -a ! "(" -f "26410-800.zip" -o -f "aacenc.c" ")" ; then
    AC_MSG_ERROR([You need downloader utility to download sources (wget, fetch or curl).])
fi

# Checks for libraries.
AC_SEARCH_LIBS([sqrt],[m])

# Checks for header files.
AC_HEADER_STDC
AC_CHECK_HEADERS([float.h memory.h stdint.h stdlib.h string.h],[],[
    AC_MSG_ERROR([You need standard header files.])
])

# Checks for typedefs, structures, and compiler characteristics.
AC_C_CONST
AC_TYPE_INT16_T
AC_TYPE_INT32_T
AC_TYPE_INT8_T
AC_TYPE_UINT16_T

# Checks for library functions.
AC_FUNC_MALLOC
AC_FUNC_MEMCMP
AC_CHECK_FUNCS([floor memmove memset pow sqrt],[],[
    AC_MSG_ERROR([You basic math functions.])
])

dnl-----------------------------------------------------------------------------
dnl link the fftw3 library if requested
dnl-----------------------------------------------------------------------------
AC_SUBST(FFTW3_INCFLAGS)
AC_SUBST(FFTW3_CFLAGS)
AC_SUBST(FFTW3_LIB)
AC_SUBST(FFTW3_LDFLAGS)

AC_ARG_WITH(fftw3,
[  --with-fftw3            use fftw3 for fast fourier conversion ([default=yes]) ],
    USE_FFTW3=${withval}, USE_FFTW3="yes" )
AC_ARG_WITH(fftw3-prefix,
[  --with-fftw3-prefix=DIR alternate location for fftw3 ([default=/usr])
			      look for libraries in FFTW3-PREFIX/lib,
			      for headers in FFTW3-PREFIX/include],
    CONFIG_FFTW3_PREFIX="${withval}", CONFIG_FFTW3_PREFIX="/usr")

if test "x${USE_FFTW3}" = "xyes" ; then
    AC_MSG_CHECKING( [for fftw3 library at ${CONFIG_FFTW3_PREFIX}] )
    LA_SEARCH_LIB( FFTW3_LIB_LOC, FFTW3_INC_LOC, libfftw3f.a libfftw3f.so, fftw3.h,
		       ${CONFIG_FFTW3_PREFIX})
    if test "x${FFTW3_LIB_LOC}" == "x" ; then
        AC_MSG_WARN( [not found])
        CONFIG_FFTW3_PREFIX="/usr/local"
        AC_MSG_CHECKING( [for fftw3 library at ${CONFIG_FFTW3_PREFIX}] )
        LA_SEARCH_LIB( FFTW3_LIB_LOC, FFTW3_INC_LOC, libfftw3f.a libfftw3f.so, fftw3.h,
		       ${CONFIG_FFTW3_PREFIX})
    fi

    if test "x${FFTW3_LIB_LOC}" != "x" ; then
	AC_DEFINE( _FFTW3, 1, [build with fftw3 library] )
	if test "x${FFTW3_INC_LOC}" != "x${SYSTEM_INCLUDE}" ; then
	    FFTW3_INCFLAGS="-I${FFTW3_INC_LOC}"
	fi
	FFTW3_LIB="-lfftw3f"
    	FFTW3_LDFLAGS="-L${FFTW3_LIB_LOC} ${FFTW3_LIB}"
    	FFTW3_CFLAGS="-I${FFTW3_LIB_LOC} ${FFTW3_LIB}"
	AC_MSG_RESULT( [found at ${CONFIG_FFTW3_PREFIX}] )
    else
	AC_MSG_WARN( [not found, building without fftw3])
    fi
else
    AC_MSG_RESULT( [building without fftw3] )
fi


dnl pkgconfig/shout-config. 
dnl If pkgconfig is found, use it and disable shout-config, otherwise do the 
dnl opposite, unless the user overrides. 

AC_ARG_ENABLE([pkgconfig],
    AC_HELP_STRING([--disable-pkgconfig],[disable pkgconfig data files (auto)]),
    [dopkgconfig="$enableval"], [dopkgconfig="maybe"])
if test "$dopkgconfig" = "maybe"
then
    AC_CHECK_PROG([PKGCONFIG], [pkg-config], [yes], [no])
else
    AC_MSG_CHECKING([whether pkgconfig should be used])
    PKGCONFIG="$dopkgconfig"
    AC_MSG_RESULT([$PKGCONFIG])
fi
AM_CONDITIONAL([HAVE_PKGCONFIG], [test "$PKGCONFIG" != "no"])
	    
AACPLUS_VERSION="$VERSION"
AACPLUS_CPPFLAGS="-I$aacplus_includedir $FFTW3_CPPFLAGS"
AACPLUS_CFLAGS+="$FFTW3_CFLAGS"
AACPLUS_LIBS="-laacplus -lm ${FFTW3_LIB}"

AC_SUBST(AACPLUS_LIBS)
AC_SUBST(AACPLUS_REQUIRES)
AC_SUBST(AACPLUS_CPPFLAGS)
AC_SUBST(AACPLUS_CFLAGS)

dnl Make substitutions 

AC_SUBST(LIBTOOL_DEPS)
AC_SUBST(OPT)
AC_SUBST(LIBS)
AC_SUBST(DEBUG)
AC_SUBST(CFLAGS)
AC_SUBST(PROFILE)

AC_CONFIG_FILES([ aacplus.spec aacplus-config aacplus.pc ])
AC_OUTPUT([ Makefile src/Makefile patches/Makefile include/Makefile frontend/Makefile ])
