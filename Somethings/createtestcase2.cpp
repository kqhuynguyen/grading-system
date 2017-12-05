#include <iostream>
#include <time.h>
#include <string>
using namespace std;
void randomword(int n)
{
	for (int i = 1; i <= n; ++i)
	{
		int j = rand() % 8 + 3; string str = "";
		for (int k = 0; k < j; ++k)
		{
			char temp = rand() % 26 + 97;
			str.push_back(temp);
		}
		if (i % 10 == 0) { cout << str << endl; }
		else cout << str << " ";
	}
}
int main()
{
	srand(time(NULL));
	int n;
	cin >> n;
	randomword(n);
	return 0;
}