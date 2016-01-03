
DISTCLEANFILES = 26410-800.zip $(top_srcdir)/26410-800.doc 26410-800-ANSI-C_source_code.zip $(library_sources_used) $(library_headers_used)
EXTRA_DIST = libaacplus.sym
INCLUDES = @FFTW3_INCFLAGS@ -I$(top_srcdir)/include
LDADD = @FFTW3_LDFLAGS@

lib_LTLIBRARIES = \
	libaacplus.la



library_sources_used = \
	aacenc.c \
	aac_rom.c \
	adj_thr.c \
	band_nrg.c \
	bitbuffer.c \
	bit_cnt.c \
	bitenc.c \
	bit_sbr.c \
	block_switch.c \
	cfftn.c \
	channel_map.c \
	code_env.c \
	dyn_bits.c \
	env_bit.c \
	env_est.c \
	fram_gen.c \
	freq_sca.c \
	grp_data.c \
	hybrid.c \
	interface.c \
	invf_est.c \
	line_pe.c \
	mh_det.c \
	ms_stereo.c \
	nf_est.c \
	pre_echo_control.c \
	ps_bitenc.c \
	ps_enc.c \
	psy_configuration.c \
	psy_main.c \
	qc_main.c \
	qmf_enc.c \
	quantize.c \
	resampler.c \
	sbr_main.c \
	sbr_misc.c \
	sbr_rom.c \
	sf_estim.c \
	spreading.c \
	stat_bits.c \
	stprepro.c \
	tns.c \
	tns_param.c \
	ton_corr.c \
	tran_det.c \
	transcendent.c \
	transform.c

libaacplus_la_SOURCES = $(library_sources_used) aacplusenc.c adts.c


libaacplus_la_LDFLAGS = \
	-export-symbols libaacplus.sym -no-undefined -version-info 2:2:0 @FFTW3_LDFLAGS@

libaacplusdir = \
	$(includedir)/libaacplus


#counters.h
library_headers_used = \
	aacenc.h \
	aac_rom.h \
	adj_thr_data.h \
	adj_thr.h \
	band_nrg.h \
	bit_cnt.h \
	bitenc.h \
	bit_sbr.h \
	block_switch.h \
	cfftn.h \
	channel_map.h \
	cmondata.h \
	code_env.h \
	dyn_bits.h \
	env_bit.h \
	env_est.h \
	FFR_bitbuffer.h \
	FloatFR.h \
	fram_gen.h \
	freq_sca.h \
	grp_data.h \
	hybrid.h \
	interface.h \
	invf_est.h \
	line_pe.h \
	mh_det.h \
	minmax.h \
	ms_stereo.h \
	nf_est.h \
	pre_echo_control.h \
	ps_bitenc.h \
	ps_enc.h \
	psy_configuration.h \
	psy_const.h \
	psy_data.h \
	psy_main.h \
	qc_data.h \
	qc_main.h \
	qmf_enc.h \
	quantize.h \
	resampler.h \
	sbr_def.h \
	sbr.h \
	sbr_main.h \
	sbr_misc.h \
	sbr_rom.h \
	sf_estim.h \
	spreading.h \
	stat_bits.h \
	stprepro.h \
	tns_func.h \
	tns.h \
	tns_param.h \
	ton_corr.h \
	tran_det.h \
	transform.h

noinst_HEADERS = $(library_headers_used) aacplusenc.h adts.h aac_ram.h sbr_ram.h

sources_delete:
	@echo echo "Deleting headers..."
	for source in $(library_headers_used); \
	do \
	    rm -f $$source; \
	done
	@echo echo "Deleting sources..."
	for source in $(library_sources_used); \
	do \
	    rm -f $$source; \
	done

sources_copy:
	@echo echo "Copying headers..."
	for source in $(library_headers_used); \
	do \
	    find $(srcdir)/FloatFR_aacPlusenc -name $$source -type f -exec cp {} $(srcdir) \; ; \
	done
	@echo echo "Copying sources..."
	for source in $(library_sources_used); \
	do \
	    find $(srcdir)/FloatFR_aacPlusenc -name $$source -type f -exec cp {} $(srcdir) \; ; \
	done

patch_all:
	@echo echo "Patching sources and headers..."
	find $(top_srcdir)/patches -name *.patch -type f -print | sort | xargs cat | $(PATCH)

remove_debugging_symbols:
	@echo echo "Removeing debugging symbols..."
	for source in $(library_sources_used); \
	do \
	sed -e 's/ADD\ *([\ 0-9\*]*)\ *;//g;' $$source | \
	sed -e 's/BRANCH\ *([\ 0-9]*)\ *;//g;' | \
	sed -e 's/DIV\ *([\ 0-9]*)\ *;//g;' | \
	sed -e 's/FUNC\ *([\ 0-9]*)\ *;//g;' | \
	sed -e 's/INDIRECT\ *([\ 0-9]*)\ *;//g;' | \
	sed -e 's/LOGIC\ *([0-9\ ]*)\ *;//g;' | \
	sed -e 's/LOOP\ *([0-9\ ]*)\ *;//g;' | \
	sed -e 's/MAC\ *([0-9\ ]*)\ *;//g;' | \
	sed -e 's/MOVE\ *([a-zA-Z_0-9\ \+\*]*)\ *;//g;' | \
	sed -e 's/MISC\ *([0-9\ ]*)\ *;//g;' | \
	sed -e 's/MULT\ *([0-9\ \*\+]*)\ *;//g;' | \
	sed -e 's/PTR_INIT\ *([0-9\ ]*)\ *;*//g;' | \
	sed -e 's/STORE.*[^;];//g;' | \
	sed -e 's/SHIFT\ *([a-zA-Z0-9\ \+]*)\ *;//g;' | \
	sed -e 's/SQRT\ *([0-9\ ]*)\ *;//g;' | \
	sed -e 's/TRANS\ *([0-9\ ]*)\ *;//g;' | \
	sed -e 's/COUNT_init\ *(.*)\ *;//g;' | \
	sed -e 's/COUNT_end\ *(.*)\ *;//g;' | \
	sed -e 's/COUNT_sub_start\ *(.*)\ *;//g;' | \
	sed -e 's/COUNT_sub_end\ *(.*)\ *;//g;' | \
	sed -e 's/COUNT_frame_update\ *(.*)\ *;//g;' | \
	sed -e 's/COUNT_ops\ *(.*)\ *;//g;' | \
	sed -e 's/COUNT_mem\ *(.*)\ *;//g;' | \
	sed -e 's/^#include\ *"counters.h"//g;' > $${source#*/}.new; \
	mv $${source#*/}.new $${source#*/}; \
	done

unpack_3gp_sources:
	if ! [ -e $(srcdir)/aacenc.c ]; \
	then \
	$(MAKE) $(srcdir)/26410-800-ANSI-C_source_code.zip; \
	$(MAKE) $(srcdir)/FloatFR_aacPlusenc; \
	rm -f $(srcdir)/26410-800-ANSI-C_source_code.zip; \
	$(MAKE) sources_delete; \
	$(MAKE) sources_copy; \
	rm -rf $(srcdir)/FloatFR_aacPlusenc; \
	chmod -x-x-x *.c *.h; \
	$(MAKE) remove_debugging_symbols; \
	$(MAKE) patch_all; \
	fi

$(library_sources_used):
	$(MAKE) unpack_3gp_sources

$(srcdir)/FloatFR_aacPlusenc:
	cd $(srcdir) && $(UNZIP) 26410-800-ANSI-C_source_code.zip
	mv -f $(srcdir)/3GPP_enhanced_aacPlus_src_*/FloatFR_aacPlusenc $(srcdir)
	rm -rf $(srcdir)/3GPP_enhanced_aacPlus_src_*


$(srcdir)/26410-800-ANSI-C_source_code.zip: $(srcdir)/26410-800.zip
	rm -f $(srcdir)/26410-800-ANSI-C_source_code.zip $(srcdir)/26410-800.doc
	cd $(srcdir) && $(UNZIP) 26410-800.zip
	mv $(srcdir)/26410-800.doc $(top_srcdir)/26410-800.doc
	chmod og-w $(top_srcdir)/26410-800.doc

$(srcdir)/26410-800.zip:
	cd $(srcdir) && $(DOWNLOADER_PROG) http://www.3gpp.org/ftp/Specs/archive/26_series/26.410/26410-800.zip

extraclean:
	rm -f $(distdir)/($(library_sources_used)) $(distdir)/($(library_headers_used)) $(distdir)/26410-800.zip $(distdir)/../26410-800.doc $(distdir)/26410-800_ANSI-C_source_code.zip

# WARNING: These commands use internal automake command and may fail in future version.
extradist-gzip: distdir extraclean
	tardir=$(distdir) && $(am__tar) | GZIP=$(GZIP_ENV) gzip -c >$(distdir).tar.gz
	$(am__remove_distdir)
extradist-bzip2: distdir extraclean
	tardir=$(distdir) && $(am__tar) | bzip2 -9 -c >$(distdir).tar.bz2
	$(am__remove_distdir)

extradist extradist-all: distdir extraclean
	tardir=$(distdir) && $(am__tar) | GZIP=$(GZIP_ENV) gzip -c >$(distdir).tar.gz
	tardir=$(distdir) && $(am__tar) | bzip2 -9 -c >$(distdir).tar.bz2
	$(am__remove_distdir)
