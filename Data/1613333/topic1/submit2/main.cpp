#include <iostream>
#include <string>
#include <sstream>
#include <fstream>
#include "fileheader.h"
using namespace std;
int main()
{
	while(1){int t=0;}
	float arr[10000]; int dem;
	readFileData("input.txt",arr, dem);
	process("output.txt",arr, dem);
	return 0;
}