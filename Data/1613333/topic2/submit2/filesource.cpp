#include <iostream>
#include <string>
#include <sstream>
#include <fstream>
#include "fileheader.h"
using namespace std;
void readFileData(string filenamein,string filenameout)
{
	fstream filein; fstream fileout;
	filein.open(filenamein, ios::in);
	fileout.open(filenameout, ios::out);
	string temp = ""; stringstream z;
	int dem = 0;
	while (getline(filein,temp))
	{
		z.clear(); z << temp;
		string str = "";
		while (z>>str)
		{
			dem++;
			for (int i = 0; i < str.length() / 2; ++i)
			{
				swap<char>(str[i], str[str.length() - i - 1]);
			}
			if (str.length() % 2 == 1)
			{
				for (int i = str.length() / 2; i < str.length(); ++i)
				{
					str[i] = str[i + 1];
				}
			}
			else
			{
				for (int i = (str.length() / 2) - 1; i < str.length(); ++i)
				{
					str[i] = str[i + 1];
				}
			}
			if (dem % 10 == 0) {
				fileout << str << endl;
			}
			else fileout << str << " ";
		}
	}
	filein.close(); fileout.close();
}