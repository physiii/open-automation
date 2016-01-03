/* Change this if the SERVER_NAME environment variable does not report
	the true name of your web server. */
#if 1
#define SERVER_NAME cgiServerName
#endif
#if 0
#define SERVER_NAME "www.boutell.com"
#endif
#define SAVED_ENVIRONMENT "/tmp/cgicsave.env"

#include <assert.h>
#include <stdio.h>
#include "cgic.h"
#include <string.h>
#include <stdlib.h>
#include <mysql.h>
#include <string.h>
//#include <my_global.h>

///////////////////////////////////////////////////////
////splits arguments based on deliminator...magic//////////
/////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////
char** str_split(char* a_str, const char a_delim)
{
char** result    = 0;
size_t count     = 0;
char* tmp        = a_str;
char* last_comma = 0;

/* Count how many elements will be extracted. */
while (*tmp)
  {
  if (a_delim == *tmp)
    {
    count++;
    last_comma = tmp;
    }
    tmp++;
    }

  /* Add space for trailing token. */
  count += last_comma < (a_str + strlen(a_str) - 1);

  /* Add space for terminating null string so caller
  knows where the list of returned strings ends. */
  count++;

  result = malloc(sizeof(char*) * count);

  if (result)
    {
    size_t idx  = 0;
    char* token = strtok(a_str, "&");

    while (token)
      {
      assert(idx < count);
      *(result + idx++) = strdup(token);
      token = strtok(0, "&");
      }
      assert(idx == count - 1);
      *(result + idx) = 0;
    }
    return result;
}
//////////////////////////////////////////
///////////////////////////////////////
///////////////////////////////////////////////////
//////////////////////////////////////////////////////
void finish_with_error(MYSQL *con)
{
  fprintf(stderr, "%s\n", mysql_error(con));
  mysql_close(con);
  exit(1);        
}

///////////////////////////////////////////////////////
///////////////start of program!/////////////////////
//////////////////////////////////////////////////////
//////////////////////////////////////////////////////
int cgiMain() {
///////////////////////////////////////////////////////
///////////////////initialize variables//////////////////////
//////////////////////////////////////////////////////
//////////////////////////////////////////////////////

char command[] = "";
char state[] ="";
char insert_sql[100] ="";
char frag[]="";
char *ap;
char Id[100]="1";
int Id_int = 0;
int door_flag=0;
//strcpy (command,cgiQueryString);

char** tokens;

if (strcmp(cgiQueryString,"")!=0)tokens = str_split(cgiQueryString, '&');

///////////////////////////////////////////////////////
///////////////////connect to mysql//////////////////////
//////////////////////////////////////////////////////
//////////////////////////////////////////////////////

MYSQL *con = mysql_init(NULL);
if (con == NULL) 
  {
      fprintf(stderr, "%s\n", mysql_error(con));
      exit(1);
  }  
if (mysql_real_connect(con, "localhost", "root", "qscwdvpk", 
          "garage", 0, NULL, 0) == NULL) 
  {
      finish_with_error(con);
  }
////////////////////////////////////////////
////////////////////////////////////////////////
///////////////////get newest Id////////////////
////////////////////////////////////////
////////////////////////////////////////
////////////////////////////////////////////////
if (mysql_query(con, "select Id from event_history order by Id desc limit 1"))
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
  char Id_str[100]="start";
  char new_id[100] = "start";
  while ((row = mysql_fetch_row(result))) 
  { 
      for(int i = 0; i < num_fields; i++) 
      { 
         sprintf(Id_str,"%s", row[i] ? row[i] : "NULL");
         Id_int = strtol(Id_str, &ap, 10); //turn results into int
         Id_int++;
         sprintf(Id,"%d",Id_int); //and convert back to string
	 strcpy(new_id,Id);
      }
  }
/////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////
///parse whatever is after server.com/script.cgi? deliniated by commas (,)///
//////////////////and insert new event and close database///////////////////////
/////////////////////////////////////////////////////////////////////////

if (tokens)
  {
  int i;
  for (i = 0; *(tokens + i); i++)
    {
    strcpy(frag, *(tokens+i)); //load next fragment


    if(strcmp(frag,"door=open")==0) {
      fprintf(cgiOut, "OPEN!");
      strcpy (insert_sql,"INSERT INTO event_history values(");
      strcat (insert_sql,new_id);
      strcat (insert_sql,",CURRENT_DATE(),NOW(),'door',1)");
      if (mysql_query(con, insert_sql)){finish_with_error(con);}
      }
    if(strcmp(frag,"door=close")==0) {
      fprintf(cgiOut, "CLOSE!");
      strcpy (insert_sql,"INSERT INTO event_history values(");
      strcat (insert_sql,new_id);
      strcat (insert_sql,",CURRENT_DATE(),NOW(),'door',0)");
      if (mysql_query(con, insert_sql)){finish_with_error(con);}
      }


    free(*(tokens + i));
    }
  free(tokens);
  }

mysql_free_result(result);
mysql_close(con);


///////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////
cgiHeaderContentType("text/html");
fprintf(cgiOut, "<HTML><HEAD>\n");
fprintf(cgiOut, "<TITLE></TITLE></HEAD>\n");
fprintf(cgiOut, "<BODY><H1></H1>\n");

fprintf(cgiOut, "\n<center>");
fprintf(cgiOut,insert_sql);
fprintf(cgiOut, "</center>\n");

fprintf(cgiOut, "<form align=\"CENTER\" method=\"GET\" enctype\"multipart/form-data\ action=\"http:\/\/physipi.zapto.org\">\n");
fprintf(cgiOut, "<input type=\"hidden\" name=\"door\" value=\"open\">");
fprintf(cgiOut, "<input type=\"submit\" value=\"OPEN!!\"></form>");

fprintf(cgiOut, "<form align=\"CENTER\" method=\"GET\" enctype\"multipart/form-data\ action=\"http:\/\/physipi.zapto.org\">\n");
fprintf(cgiOut, "<input type=\"hidden\" name=\"door\" value=\"close\">\n");
fprintf(cgiOut, "<input type=\"submit\" value=\"CLOSE!!\"></form>\n");

fprintf(cgiOut, "\n");
fprintf(cgiOut, "<center><img src=\"http:\/\/99.74.193.31:8081\"></center>\n");
fprintf(cgiOut, "\n");
fprintf(cgiOut, "\n");
fprintf(cgiOut, "\n");

fprintf(cgiOut, "</BODY></HTML>\n");
return 0;
}
