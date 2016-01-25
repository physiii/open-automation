#Edit the bin dir below to the cgi-bin directory of your webserver
bindir = /usr/lib/cgi-bin

CFLAGS= -std=gnu99 -g -Wall -O3
CFLAGS+= `pkg-config --libs --cflags libcurl` `mysql_config --cflags --libs`
CC=gcc
AR=ar
RANLIB=ranlib
LIBS=-L./ -lcgic -L/var/www
INSTALL = install

all: libcgic.a cgictest.cgi capture nph-mjprox nph-mjgrab

install: libcgic.a
	cp libcgic.a /usr/local/lib
	cp cgic.h /usr/local/include
	@echo libcgic.a is in /usr/local/lib. cgic.h is in /usr/local/include.
	mkdir -p $(bindir)
	$(INSTALL) nph-mjgrab $(bindir)
	$(INSTALL) nph-mjprox $(bindir)
	$(INSTALL) cgictest.cgi $(bindir)
	
libcgic.a: cgic.o cgic.h
	rm -f libcgic.a
	$(AR) rc libcgic.a cgic.o
	$(RANLIB) libcgic.a
	
nph-mjprox : nph-mjprox.c
	$(CC) $(CFLAGS) nph-mjprox.c -o nph-mjprox $(CC_LDFLAGS)

nph-mjgrab : nph-mjgrab.c
	$(CC) $(CFLAGS) nph-mjgrab.c -o nph-mjgrab $(CC_LDFLAGS)
	

#mingw32 and cygwin users: replace .cgi with .exe

cgictest.cgi: cgictest.o libcgic.a
	gcc cgictest.o -o cgictest.cgi ${LIBS}

capture: capture.o libcgic.a
	gcc capture.o -o capture ${LIBS}

clean:
	rm -f *.o *.a cgictest.cgi capture
	rm nph-mjgrab nph-mjprox

