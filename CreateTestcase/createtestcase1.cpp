#include <iostream>
#include <time.h>
#include <string>
#include <fstream>
using namespace std;

void random_float(int n)
{
	for (int i = 1; i <= n; ++i)
	{
		float temp = float(rand() % 10000) / float(100);
		if (i % 10 == 0) cout << temp << endl;
		else cout << temp << " ";
	}
}

int main(int argc, char* argv[])
{
	srand(time(NULL));
	random_float(stoi(argv[1]));
	return 0;
}
