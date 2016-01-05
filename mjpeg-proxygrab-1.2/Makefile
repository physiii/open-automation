#Edit the bin dir below to the cgi-bin directory of your webserver
bindir = /usr/lib/cgi-bin

CFLAGS=-g -Wall -O3
CC=gcc
AR=ar
RANLIB=ranlib
LIBS=-L./ -lcgic
INSTALL = install

all: nph-mjprox nph-mjgrab libcgic.a cgictest.cgi capture

install: libcgic.a
	cp libcgic.a /usr/local/lib
	cp cgic.h /usr/local/include
	@echo libcgic.a is in /usr/local/lib. cgic.h is in /usr/local/include.
	mkdir -p $(bindir)
	$(INSTALL) nph-mjgrab $(bindir)
	$(INSTALL) nph-mjprox $(bindir)
	$(INSTALL) cgictest.cgi $(bindir)

nph-mjprox : nph-mjprox.c
	$(CC) $(CFLAGS) nph-mjprox.c -o nph-mjprox $(CC_LDFLAGS)

nph-mjgrab : nph-mjgrab.c
	$(CC) $(CFLAGS) nph-mjgrab.c -o nph-mjgrab $(CC_LDFLAGS)
	
libcgic.a: cgic.o cgic.h
	rm -f libcgic.a
	$(AR) rc libcgic.a cgic.o
	$(RANLIB) libcgic.a

#mingw32 and cygwin users: replace .cgi with .exe

cgictest.cgi: cgictest.o libcgic.a
	gcc cgictest.o -o cgictest.cgi ${LIBS}

capture: capture.o libcgic.a
	gcc capture.o -o capture ${LIBS}

clean:
	rm -f *.o *.a cgictest.cgi capture
	rm nph-mjgrab nph-mjprox

