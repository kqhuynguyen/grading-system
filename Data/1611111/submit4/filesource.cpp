#include <iostream>
#include <string>
#include <sstream>
#include <fstream>
#include "fileheader.h"
using namespace std;
void readFileData(string filenamein,float* arr,int &dem)
{
	fstream file; file.open(filenamein, ios::in);
	dem = 0; string data; stringstream z;
	while (getline(file,data))
	{
		z.clear(); z << data; float temp;
		while (z>>temp)
		{
			arr[dem++] = temp;
		}
	}
	file.close();
}
void process(string filenameout,float* arr, int n)
{
	fstream file; file.open(filenameout, ios::out);
	float s = 0; float max = arr[0], min = arr[0];
	for (int i = 0; i < n; ++i)
	{
		s += arr[i];
		if (arr[i] > max) max = arr[i];
		if (arr[i] < min) min = arr[i];
	}
	file << s << " " <<max<< " " << min << " " << s / float(n) << endl;
	file.close();
}