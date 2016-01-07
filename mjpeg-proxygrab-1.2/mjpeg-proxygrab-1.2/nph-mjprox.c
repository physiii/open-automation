/*	Kenneth Lavrsen's mjpeg proxy for Motion: nph-mjprox
 *	This program is published under the GNU Public license
 *  Version 1.0 - 2003 November 19 - Initial Release
 *  Version 1.1 - 2003 November 22 - Greatly improved by Folkert van Heusden
 *    inspired by a suggestion from Torben Jensen
 *  Version 1.2 - 2004 April 02 - Fix for old versions of gcc provided by
 *    Christophe Grenier 
 *  
 *	The program opens a socket to a running Motion webcam server
 *	It then fetches the mjpeg stream from the Motion webcam server
 *	and sends it to standard out (browser).
 *	The idea is that the browser gets the stream from the standard http
 *	port 80 so that company firewalls does not block the stream.
 *	Additionally this program enables the webserver to be on one IP address
 *	and motion running on another IP address and an applet such as
 *	Cambozola will still work because it gets the stream from the webserver.
 *
 *	This program is made as a cgi program for for example an Apache server
 *	It runs as a nph (direct to browser) program. It takes one variable
 *	which is the camera (Motion thread number).
 *	The program must be copied to a directory from which cgi scripts can run.
 *	It must be have access rights set as executable for the web server.
 *	The program must be named with the prefix nph- .
 *	To use it with for example Cambozola add this to an HTML page
 *
 *	<applet code=com.charliemouse.cambozola.Viewer
 *		archive=cambozola6.jar width=325 height=245>
 *		<param name=url value="/cgi-bin/nph-mjprox?1">
 *		<param name="accessories" value="none"/>
 *	</applet> 
 *
 *  Note the number after the "?". This is the camera number (Motion thread no.)
 *
 *	Below the 3 #defines must be set before you build the program.
 *	You need to set IP address of the motion server, the portbase
 *	and the upper limit for the number of cameras you have.
 *	IP address 127.0.0.1 means local host (same machine).
 *	PORTBASE is the number from which the webcam port is calculated.
 *	The calculated port = PORTBASE + Camera Number (thread number).
 *	So if thread 1 has the webcam port set to 8081 the PORTBASE should be 8080
 *	Program can be built with this command:
 *	gcc -Wall -O3 -o nph-mjprox nph-mjprox.c
 */

#include <stdlib.h>
#include <sys/types.h>
#include <sys/socket.h>
#include <stdio.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <unistd.h>
#include <errno.h>

/*  User defined parameters - EDIT HERE */
#define IPADDR "127.0.0.1" /* IP address of motion server, 127.0.0.1 = localhost */
#define PORTBASE 8080      /* If your camera 1 is on port 8081 set this to one lower = 8080 */
#define UPPERCAMERANUMBER 12  /* Set this to your upper limit of cameras */

int main()
{
	int sockfd;
	int len;
	int cameranumber;
	struct sockaddr_in address;
	int result;
	char *querystr;
	char *dummy;
	char buffer[65536];

/*	Get camera number from querystring  */
	
	querystr = getenv("QUERY_STRING");
	sscanf(querystr,"%d",&cameranumber);
	if (cameranumber<1 || cameranumber>UPPERCAMERANUMBER)
	{
		exit(0);
	}

/*  Create a socket for the client.  */

	sockfd = socket(AF_INET, SOCK_STREAM, 0);

/*  Name the socket, as agreed with the server.  */

	address.sin_family = AF_INET;
	address.sin_addr.s_addr = inet_addr(IPADDR);
	address.sin_port = htons(PORTBASE + cameranumber);
	len = sizeof(address);

/*  Now connect our socket to the server's socket.  */

	result = connect(sockfd, (struct sockaddr *)&address, len);

	if(result == -1)
	{
		perror("oops: Cannot connect to Motion");
		exit(1);
	}

/*  We can now read/write via sockfd.  */

	for(;;)
	{
		int n;
		dummy = buffer;

		/* read as much as is possible for a read
		* if less is available: don't worry, read will return
		* what is available
		*/
		n = read(sockfd, buffer, 65536);

		/* read failed? */
		if (n == -1)
		{
			/* read was interrupted? then just do it
			* again
			*/
			if (errno == EINTR)
				continue;

			exit(1);
		}
		/* n=0 means socket is closed */
		if (n == 0)
			break;

		/* send received buffer to stdout descriptor
		* again: as much as possible so that you have
		* not so much buffers
		*/
		while(n > 0)
		{
			int nsend;
			/* send some */
			nsend = write(1, dummy, n);

			if (nsend == -1)
			{
				if (errno == EINTR)
					continue;

				exit(1);
			}
			/* strange: stdout is close?! */
			else if (nsend == 0)
				exit(1);

			/* keep track of what was send */
			dummy += nsend;
			n -= nsend;
		}
	}

	close(sockfd);
	exit(0);
}
