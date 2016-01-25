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

#include <sys/ioctl.h>
#include <net/if.h> 
#include <unistd.h>
#include <errno.h>
#include <curl/curl.h>
#include <stdlib.h>
#include <string.h>
#include <sys/types.h>
#include <sys/socket.h>
#include <stdio.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <unistd.h>
#include <my_global.h>
#include <mysql.h>

/*  User defined parameters - EDIT HERE */
#define IPADDR "127.0.0.1" /* IP address of motion server, 127.0.0.1 = localhost */
#define PORTBASE 8080      /* If your camera 1 is on port 8081 set this to one lower = 8080 */
#define UPPERCAMERANUMBER 12  /* Set this to your upper limit of cameras */
#define MAXLEN 80
#define EXTRA 5
/* 4 for field name "data", 1 for "=" */
#define MAXINPUT MAXLEN+EXTRA+2
/* 1 for added line break, 1 for trailing NUL */
#define DATAFILE "../data/data.txt"


int create_database();
int create_tables();
int get_token();
void unencode();
void get_mac();
int check_token(char *,char *);
int store_token(char *,char *,char *,char *,char *);
int get_local_token(char *,char *,char *,char *);
int get_new_token(char *,char *,char *,char *,char *,char *,char *);

struct string {
  char *ptr;
  size_t len;
};

void finish_with_error(MYSQL *con)
{
  fprintf(stderr, "%s\n", mysql_error(con));
  mysql_close(con);
  exit(1);        
}

void init_string(struct string *s) {
  s->len = 0;
  s->ptr = malloc(s->len+1);
  if (s->ptr == NULL) {
    fprintf(stderr, "malloc() failed\n");
    exit(EXIT_FAILURE);
  }
  s->ptr[0] = '\0';
}

size_t writefunc(void *ptr, size_t size, size_t nmemb, struct string *s)
{
  size_t new_len = s->len + size*nmemb;
  s->ptr = realloc(s->ptr, new_len+1);
  if (s->ptr == NULL) {
    fprintf(stderr, "realloc() failed\n");
    exit(EXIT_FAILURE);
  }
  memcpy(s->ptr+s->len, ptr, size*nmemb);
  s->ptr[new_len] = '\0';
  s->len = new_len;

  return size*nmemb;
}

int main()
{
  int authorized = 0;
  char user[30] = "init";
  char password[30] = "init";
  char *data;
  data = getenv("QUERY_STRING");
  char *p;
  char tmp[30]="temp";
  char mac_address[12] = "";
  char local_token[200] = ""; 
  char remote_token[200] = "start";
  char server[200] = "";
  char device_name[200] = "";
  char device_port[200] = "";  
  get_mac(mac_address);
  
  printf("HTTP/1.1 200 OK\n");
  printf("Content-Type: text/html\n\n");
  printf("<html>\n");
  printf("<form action='/cgi-bin/nph-mjprox' METHOD='GET'>\n");
  printf("<div><input name='tkn' value='0' type='hidden'></div>\n");    
  printf("<div><label>Username: <input name='user' size='5'></label></div>\n");
  printf("<div><label>Password: <input name='password' size='5'></label></div>\n");
  printf("<div><label>Device Name: <input name='device_name' size='5'></label></div>\n");
  printf("<div><label>Device Port: <input name='device_port' size='5'></label></div>\n");    
  printf("<div><label>Server: <input name='server' size='5'></label></div>\n");
  printf("<div><input type='submit' value='Login'></div>\n");
  printf("</form>\n");

  if(create_database()){
    printf("created device database<br>");
  }
  
  if(create_tables()){
    printf("created tables<br>");
  }

  printf("</html>\n");
  
  p = strtok (data,"&");
  while (p != NULL)
  {
    strcpy (tmp,p);    
    if (strncmp(tmp, "tkn=", 4) == 0) { 
      sscanf(tmp,"tkn=%s",remote_token);
    }
    if (strncmp(tmp, "user=", 5) == 0) { 
      sscanf(tmp,"user=%s",user);      
    }
    if (strncmp(tmp, "password=", 9) == 0) { 
      sscanf(tmp,"password=%s",password);      
    } 
    if (strncmp(tmp, "device_name=", 12) == 0) { 
      sscanf(tmp,"device_name=%s",device_name);   
    }
    if (strncmp(tmp, "device_port=", 5) == 0) { 
      sscanf(tmp,"device_port=%s",device_port);      
    }
    if (strncmp(tmp, "server=", 7) == 0) { 
      sscanf(tmp,"server=%s",server);      
    }    
    p = strtok (NULL, "&");
  }
  
  strcpy(server,"68.12.157.176:8080/pyfi.org");
  //server = "68.12.157.176:8080/pyfi.org";
  if (strncmp(remote_token, "0", 1) == 0) { 
    if(get_new_token(mac_address,user,password,local_token,device_name,device_port,server)){
      store_token(mac_address,user,local_token,device_name,device_port);
      printf("<<-- stored local token: %s \n-->>",local_token);          
      authorized = 1;
    }
  }
  
  printf("remote_token: %s",remote_token);
  if (check_token(user,remote_token)){
    printf("remote_token: %s",remote_token);
    authorized = 1;
  }
  
  //authorized = 0;
  if (authorized){
    int sockfd;
    int len;
    int cameranumber;
    struct sockaddr_in address;
    int result;
    char *querystr;
    char *dummy;
    char buffer[65536];
    
    /*Get camera number from querystring  */
    cameranumber=1;
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
  return 0;
}

int create_tables(void)
{
  MYSQL *con = mysql_init(NULL);
  
  if (con == NULL) 
  {
      fprintf(stderr, "%s\n", mysql_error(con));
      return 0;
  }

  if (mysql_real_connect(con, "localhost", "root", "password", 
          "device", 0, NULL, 0) == NULL) 
  {
      finish_with_error(con);
  }    

  if (mysql_query(con, "create table video_tok(timestamp text, user text, token text, mac text, device_name text, port text)")) {      
    fprintf(stderr, "%s\n", mysql_error(con));
    mysql_close(con);
    return 0;
  }

  mysql_close(con);

  return 1;
}

int create_database(void)
{
  MYSQL *con = mysql_init(NULL);

  if (con == NULL) 
  {
      fprintf(stderr, "%s\n", mysql_error(con));
      return 0;
  }

  if (mysql_real_connect(con, "localhost", "root", "password", 
          NULL, 0, NULL, 0) == NULL) 
  {
      fprintf(stderr, "%s\n", mysql_error(con));
      mysql_close(con);
      return 0;
  }  

  if (mysql_query(con, "create database device")) 
  {
      fprintf(stderr, "%s\n", mysql_error(con));
      mysql_close(con);
      return 0;
  }

  mysql_close(con);
  printf("create database");
  return 1;
}

void get_mac(char * mac_address)
{
  struct ifreq s;
  int fd = socket(PF_INET, SOCK_DGRAM, IPPROTO_IP);
  strcpy(s.ifr_name, "eth0");
  if (0 == ioctl(fd, SIOCGIFHWADDR, &s)) {
    int i;char temp[2];
    for (i = 0; i < 6; ++i) {
      sprintf(temp, "%02x", (unsigned char) s.ifr_addr.sa_data[i]);
      strcat(mac_address,temp);
    }
    //printf("mac: %s",mac_address);
  }
}

int store_token(char * mac_address,char * user,char * token,char * device_name,char * device_port)
{
  MYSQL *con = mysql_init(NULL);

  if (con == NULL) 
  {
      fprintf(stderr, "%s\n", mysql_error(con));
      exit(1);
  }

  if (mysql_real_connect(con, "localhost", "root", "password", 
          "device", 0, NULL, 0) == NULL) 
  {
      finish_with_error(con);
  }    

  char query[400] = "";
  snprintf(query,sizeof(query),"insert into video_tok values(now(),'%s','%s','%s','%s','%s')",user,token,mac_address,device_name,device_port);
  printf("store_token: %s",query);
  if (mysql_query(con, query)) {
      finish_with_error(con);
  }
  mysql_close(con);
  return 0;
}

int check_token(char * user,char * token)
{
 
  MYSQL *con = mysql_init(NULL);

  if (con == NULL) 
  {
      fprintf(stderr, "%s\n", mysql_error(con));
      exit(1);
  }

  if (mysql_real_connect(con, "localhost", "root", "password", 
          "device", 0, NULL, 0) == NULL) 
  {
      finish_with_error(con);
  }    

  char query[200] = "";
  char tkn[200] = "init";  
  snprintf(query,sizeof(query),"select token from video_tok where user='%s' limit 1",user);
  if (mysql_query(con, query)) 
  {
      finish_with_error(con);
  }
  MYSQL_RES *result = mysql_store_result(con);

  if (result == NULL) 
  {
      finish_with_error(con);
  }

  int num_fields = mysql_num_fields(result);

  MYSQL_ROW row;
  
  while ((row = mysql_fetch_row(result))) 
  { 
      for(int i = 0; i < num_fields; i++) 
      { 
          snprintf(tkn,sizeof(tkn),row[i] ? row[i] : "NULL");
      } 
          printf("\n"); 
  }

  //printf("stored_tkn: %s | remote_token: %s",tkn,token);
  if (strncmp(token, tkn, 128) == 0) { 
    return 1;
  }
  mysql_free_result(result);
  mysql_close(con);
  return 0;
}

int get_new_token(char * mac_address,char * user,char * password,char * token,char * device_name,char * device_port,char * server)
{
  CURL *curl;
  CURLcode res; 

  char url[200] = "http://";
  strcat(url,server);
  strcat(url,"/php/set_video.php?mac=");
  strcat(url,mac_address);
  strcat(url,"&user=");
  strcat(url,user);
  strcat(url,"&pwd=");  
  strcat(url,password);  
  strcat(url,"&port=");  
  strcat(url,device_port);
  strcat(url,"&device_name=");  
  strcat(url,device_name);

  printf("<<-- url: %s \n-->><br><br>",url);
  curl = curl_easy_init();
  if(curl) {
    struct string s;
    init_string(&s);

    curl_easy_setopt(curl, CURLOPT_URL, url);
    curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, writefunc);
    curl_easy_setopt(curl, CURLOPT_WRITEDATA, &s);
    res = curl_easy_perform(curl);
    //printf("%s\n", s.ptr);
    strcpy(token,s.ptr);   
    free(s.ptr);
    /* always cleanup */
    curl_easy_cleanup(curl);
    int len = strlen(token);
    
    if (len < 128) {
      printf("invalid username or password");
      return 0;
    }
  }  
  return 1;
}

void unencode(char *src, char *last, char *dest)
{
 for(; src != last; src++, dest++)
   if(*src == '+')
     *dest = ' ';
   else if(*src == '%') {
     int code;
     if(sscanf(src+1, "%2x", &code) != 1) code = '?';
     *dest = code;
     src +=2; }     
   else
     *dest = *src;
 *dest = '\n';
 *++dest = '\0';
}
