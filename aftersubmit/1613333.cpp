#include<iostream>
#include<fstream>
#include<string>
#include<sstream>
#include<vector>
using namespace std;
int main()
{
	std::fstream file;
	file.open("input.txt", ios::in);
	string data; stringstream z; float sum,max,min,avr;
	vector<float> vt;
	while (getline(file,data))
	{
		z.clear();
		z << data; float temp;
		while (z>>temp)
		{
			vt.push_back(temp);
		}
	}
	file.close();
	sum = 0; max = vt[0]; min = vt[0];
	for (int i = 0; i < vt.size(); ++i)
	{
		sum += vt[i];
		if (vt[i] > max)max = vt[i];
		if (vt[i] < min)min = vt[i];
	}
	avr = sum / float(vt.size());
	file.open("output.txt",ios::out);
	file << sum << endl;
	file << max << endl;
	//file << min << endl;
	//file << avr << endl;
	file.close();
	return 0;
}