#include <iostream>
#include <time.h>
#include <string>
#include <sstream>
using namespace std;
void readfile() 
{
	string temp = ""; stringstream z;
	int dem = 0;
	while (cin>>temp)
	{
		z.clear(); string str = ""; dem++;
		z << temp; z >> str;
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
			for (int i = (str.length() / 2)-1; i < str.length(); ++i)
			{
				str[i] = str[i + 1];
			}
		}
		if (dem % 10 == 0) {
			cout << str <<endl;
		}
		else cout << str << " ";
	}
}
int main()
{
	readfile();
	return 0;
}