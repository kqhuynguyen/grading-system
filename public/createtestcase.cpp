#include <iostream>
#include <time.h>
#include <string>
#include <fstream>
using namespace std;
void random_float(string filename,int n)
{
	fstream file;
	file.open(filename, ios::out);
	for (int i = 1; i <= n; ++i) 
	{
		float temp = float(rand() % 10000) / float(100);
		if (i % 10 == 0) file << temp << endl;
		else file << temp << " ";
	}
	file.close();
}
int main()
{
	srand(time(NULL));
	random_float("input1.txt",100);
	random_float("input2.txt", 1000);
	return 0;
}