#include <iostream>
#include "fileheader.h"
using namespace std;
int main()
{
	float arr[10000]; int dem;
	readFileData(arr, dem);
	process(arr, dem);
	return 0;
}