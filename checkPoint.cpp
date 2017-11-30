#include <fstream>
#include <iostream>
#include <string>

// MAIN IDEA
// get lecturer input file from command line
// after that, we will load student input file from command line and compare
// with the temp file above
// points will be graded after calculating percent of matched result

template <typename T> struct node {
  node<T> *link;
  T data;
  node<T>(T newData) {
    this->data = newData;
    link = NULL;
  }
  node<T>() { link = NULL; }
  ~node() {}
  void Get(T newData) { this->data = newData; }
};

// load lecturer file output form console
float CheckLecAndStu(char **argv) {
  std::ifstream LecturerFile(argv[1]);
  std::ifstream StudentFile(argv[2]);

  // linked list storing data in student file
  node<std::string> *yourDataHeap = new node<std::string>;
  node<std::string> *yourTempHeap = yourDataHeap;
  // read every line of text file
  std::string temp;
  int count = 0;
  float mark = 0.0f;

  if (StudentFile.is_open()) {
    while (StudentFile >> temp) {
      // each time read, record to a vector
      yourTempHeap->link = new node<std::string>(temp);
      yourTempHeap = yourTempHeap->link;
      temp = "";
      count++;
    }
  }
  StudentFile.close();
  count = 0;

  // create new file storing student output enclosing grading and note
  char *newFile = argv[2];
  int step = 0;
  while (newFile[step] != '.') {
    step++;
  }
  // I don't like these lines, but anyway, it's the simplest way
  newFile[step] = 'X';
  newFile[step + 1] = '.';
  newFile[step + 2] = 't';
  newFile[step + 3] = 'x';
  newFile[step + 4] = 't';
  newFile[step + 5] = '\0';

  // rewrite file output to record where is the problem
  std::ofstream StudentFileX(newFile);
  StudentFileX << "This is result after testing completely. If there is a '!' "
                  "in a line, which means that line is an incorrect "
                  "value.\nYour point depends on how many '!' appear in your "
                  "result."
               << std::endl;

  yourTempHeap = yourDataHeap;
  // in each line, there are number of datas to read
  if (LecturerFile.is_open()) {
    while (LecturerFile >> temp) {
      // compare string between lecturer file and student file
      // using string compare: if 0, it totally matched
      if (yourTempHeap->link) {
        int unMatch = temp.compare(yourTempHeap->link->data);
        if (unMatch == 0) {
          // grade plus 1
          mark = mark + 1;
          StudentFileX << yourTempHeap->link->data << std::endl;
        } else {
          // unmatched, no mark
          // enclosing '!' for student to know he/she error
          StudentFileX << yourTempHeap->link->data;
          StudentFileX << "!" << std::endl;
        }
        temp = "";
        yourTempHeap = yourTempHeap->link;
      }
      count++;
    }
  }
  LecturerFile.close();
  mark = mark / count;
  return mark * 10;
}

int main(int argc, char **argv) {
  std::cout << CheckLecAndStu(argv);
  return 0;
}