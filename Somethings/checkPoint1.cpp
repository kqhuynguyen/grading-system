#include <cmath>
#include <ctime>
#include <fstream>
#include <iostream>
#include <sstream>
#include <string>
#include <vector>

#define EPSILON std::pow(10, -5)

// MAIN IDEA
// get lecturer input file from command line
// after that, we will load student input file from command line and compare
// with the temp file above
// points will be graded after calculating percent of matched result

// load lecturer file output form console
int LoadLecAndStu(char **argv, float *myDataHeap,
                   float *yourDataHeap) {
  std::ifstream LecturerFile(argv[1]);
  std::ifstream StudentFile(argv[2]);
  // read every line of text file
  float temp;
  int count = 0;

  if (StudentFile.is_open()) {
    while (StudentFile >> temp) {
      // each time read, record to a vector
      * (yourDataHeap + count) = temp;
      count++;
    }
  }
  StudentFile.close();
  count = 0;

  // in each line, there are number of datas to read
  if (LecturerFile.is_open()) {
    while (LecturerFile >> temp) {
      // each time read, record to a vector
      * (myDataHeap + count) = temp;
      count++;
    }
  }
  LecturerFile.close();

  return count;
}

float Grade(char** argv, float *myDataHeap, float *yourDataHeap, int size) {
  // rename the result
  char* newFile = argv[2];
  int step = 0;
  while (newFile[step] != '.'){
    step++;
  }
  // I don't like these lines, but anyway, it's the simplest way
  newFile[step] = 'X';
  newFile[step + 1] = '.';
  newFile[step + 2] = 't';
  newFile[step + 3] = 'x';
  newFile[step + 4] = 't';
  
  // rewrite file output to record where is the problem
  std::ofstream StudentFileX(newFile);
  StudentFileX << "This is result after testing completely. If there is a '!' in a line, which means that line is an incorrect value.\nYour point depends on how many '!' appear in your result." << std::endl;

  float mark = 0;
  for (int index = 0; index < size; index++) {
    if (std::abs(myDataHeap[index] - yourDataHeap[index]) < EPSILON){
      mark = mark + 1;
      // no problem, keep going
      StudentFileX << yourDataHeap[index] << std::endl;
    } else {
      // there is mismatched, record and hit "!"
      StudentFileX << yourDataHeap[index];
      StudentFileX << "!" << std::endl;
    }
  }
  StudentFileX.close();
  mark = mark / size;
  return mark * 10;
}

int main(int argc, char **argv) {
  float *myDataHeap = new float;
  float *yourDataHeap = new float;
  int size = LoadLecAndStu(argv, myDataHeap, yourDataHeap);
  std::cout << Grade(argv, myDataHeap, yourDataHeap, size);

  return 0;
}
