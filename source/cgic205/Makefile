CFLAGS=-std=c99 -g -Wall -I/usr/include/mysql -DBIG_JOINS=1  -fno-strict-aliasing  -g
CC=gcc
AR=ar 
RANLIB=ranlib 
LIBS=-L./ -lcgic -L/usr/lib/arm-linux-gnueabihf -lmysqlclient -lpthread -lz -lm -lrt -ldl 

all: libcgic.a cgictest.cgi capture

install: libcgic.a
	cp libcgic.a /usr/local/lib
	cp cgic.h /usr/local/include
	@echo libcgic.a is in /usr/local/lib. cgic.h is in /usr/local/include.

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

