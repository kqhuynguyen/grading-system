#include <fstream>
#include <iomanip>
#include <iostream>
#include <string>

#define EPSILON 0.000001

// COMMAND LINE: rank <Student list> <rank Index> <increase(1)/decrease(0)>
// rank index is the attribute to rank student
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

class student {
public:
  std::string id;
  std::string name;
  int timesSubmit;
  float grade;
  std::string mail;
  student(){};
  ~student(){};
  void operator=(student you) {
    this->id = you.id;
    this->name = you.name;
    this->timesSubmit = you.timesSubmit;
    this->grade = you.grade;
    this->mail = you.mail;
  }
  bool operator>=(student you) {
    if (this->grade - you.grade <= EPSILON)
      return false;
    return true;
  }
  void print() {
    std::cout << std::left << std::setw(10) << this->id << std::setw(10)
              << this->name << std::setw(10) << this->timesSubmit
              << std::setw(10) << this->grade << std::setw(10) << this->mail
              << std::endl;
  }
};
template <typename T> int loadCSV(char **argv, node<T> *&accounts) {
  node<T> *tempAcc = accounts;
  std::ifstream dsSinhVien(argv[1]);
  // string for reading the file
  // and string for reading each character
  std::string readFile;
  std::string temp = "";

  // count the position of character in the string
  // in order to know the position and skip the comma
  int count = 0;
  // mark the type of info in order to assign correctly
  int studentInfo = 0;
  // mark the position of each account in the file
  int accountIndex = 0;
  if (dsSinhVien.is_open()) {

    // skip first line
    dsSinhVien >> readFile;
    // start reading from second line
    // which contain data of student point
    while (dsSinhVien >> readFile) {
      // temp student
      student me;
      while (readFile[count] != '\0') {
        if (readFile[count] != ',') {
          // storing each character till reaching comma
          temp += readFile[count];
        } else if (readFile[count] == ',') {
          // reach comma, let's check the student info
          if (studentInfo == 0)
            me.id = temp;
          else if (studentInfo == 1)
            me.name = temp;
          else if (studentInfo == 2)
            me.timesSubmit = std::stoi(temp);
          else if (studentInfo == 3)
            me.grade = std::stof(temp);
          temp = "";
          studentInfo++;
        }
        count++;
      }
      me.mail = temp;
      // reset temp string to blank, ready to contains next line character
      temp = "";
      count = 0;
      studentInfo = 0;

      // store student info to linked list
      tempAcc->link = new node<T>(me);
      tempAcc = tempAcc->link;

      // increasing the size of the list
      accountIndex++;
    }
  }
  dsSinhVien.close();
  return accountIndex;
}

///
/// MERGE SORT---------------------------------------------
///
bool lCompare(student A, student B, char rankIndex, char increase) {
  // rankIndex: 0-id, 1-name, 2-timesSubmit, 3-grade, 4-mail
  if (increase == '0') {
    if (rankIndex == '0') {
      if (A.id.compare(B.id) >= 0)
        return true;
    } else if (rankIndex == '1') {
      if (A.name.compare(B.name) >= 0)
        return true;
    } else if (rankIndex == '2') {
      if (A.timesSubmit - B.timesSubmit >= 0)
        return true;
    } else if (rankIndex == '3') {
      if (A.grade - B.grade >= 0)
        return true;
    } else if (rankIndex == '4') {
      if (A.mail.compare(B.mail) >= 0)
        return true;
    }
    return false;
  } else {
    if (rankIndex == '0') {
      if (A.id.compare(B.id) >= 0)
        return false;
    } else if (rankIndex == '1') {
      if (A.name.compare(B.name) >= 0)
        return false;
    } else if (rankIndex == '2') {
      if (A.timesSubmit - B.timesSubmit >= 0)
        return false;
    } else if (rankIndex == '3') {
      if (A.grade - B.grade >= 0)
        return false;
    } else if (rankIndex == '4') {
      if (A.mail.compare(B.mail) >= 0)
        return false;
    }
    return true;
  }
}

template <typename T> void Divide(node<T> *&list, node<T> *&list2) {
  node<T> *temp = list->link;
  node<T> *middle = list;
  while (temp) {
    temp = temp->link;
    if (temp) {
      temp = temp->link;
      middle = middle->link;
    }
  }
  list2 = middle->link;
  middle->link = NULL;
}

template <typename T>
void Merge(node<T> *&list, node<T> *&list2, char rankIndex, char increase) {
  node<T> *lastSorted = new node<T>();
  node<T> *combine = lastSorted;
  while (list && list2) {
    if (lCompare(list->data, list2->data, rankIndex, increase)) {
      lastSorted->link = list;
      lastSorted = list;
      list = list->link;
    } else {
      lastSorted->link = list2;
      lastSorted = list2;
      list2 = list2->link;
    }
  }
  if (!list) {
    lastSorted->link = list2;
    list2 = NULL;
  } else {
    lastSorted->link = list;
  }
  list = combine->link;
}

template <typename T>
void RMergeSort(node<T> *&list, char rankIndex, char increase) {
  if (list && list->link) {
    node<T> *list2;
    Divide(list, list2);
    RMergeSort(list, rankIndex, increase);
    RMergeSort(list2, rankIndex, increase);
    Merge(list, list2, rankIndex, increase);
  }
}

template <typename T>
node<T> *MergeSort(node<T> *&head, char rankIndex, char increase) {
  RMergeSort(head, rankIndex, increase);
  return head;
}

int main(int argc, char **argv) {
  // linked list storing all account info
  node<student> *accounts = new node<student>();
  int size = loadCSV(argv, accounts);

  // ranking from greatest to smallest grade
  node<student> *print = MergeSort(accounts->link, argv[2][0], argv[3][0]);
  node<student> *temp = print;

  // print result to file
  std::cout << std::left << std::setw(10) << "ID" << std::setw(10) << "Name"
            << std::setw(10) << "Times" << std::setw(10) << "Grade"
            << std::setw(10) << "Email" << std::endl;
  while (temp) {
    temp->data.print();
    temp = temp->link;
  }

  return 0;
}