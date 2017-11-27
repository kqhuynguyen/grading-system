#include <iostream>
#include "fileheader.h"
using namespace std;
void readFileData(float* arr,int &dem)
{
	dem = 0;
	while (cin>>arr[dem++])
	{}
}
void process(float* arr, int n)
{
	float s = 0; float max = arr[0], min = arr[0];
	for (int i = 0; i < n; ++i)
	{
		s += arr[i];
		if (arr[i] > max) max = arr[i];
		if (arr[i] < min) min = arr[i];
	}
	cout << s << " " << s / float(n) << " " << max << " " << min << endl;
}