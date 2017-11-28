#include<string>
using namespace std;
#ifndef fileheader_h
#define fileheader_h
void readFileData(string filenamein,float *arr,int &dem);
void process(string filenameout,float *arr, int n);
#endif // !fileheader.h