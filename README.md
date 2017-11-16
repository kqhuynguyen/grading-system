# HỆ THỐNG CHẤM ĐIỂM TỰ ĐỘNG PROGRAMMING TRÊN HTML
## Chương trình
### Cơ chế
Hệ thống chấm điểm tự động các dự án lập trình C++, với dự án đối chiếu và so sánh đã được cập nhật bới giáo viên (hoặc quản trị hệ thống) vào một chủ đề nhất định.<br>
Các người dùng khác sau khi đăng nhập vào một chủ đê tương ứng với dự án đang thực hiện, sẽ gửi file .rar (hoặc .zip) lên hệ thống và chờ kết quả.<br>
Kết quả được lưu dưới dạng file .txt. <br>
Hệ thống cho phép gửi nhiều lần và chỉ lấy kết quả ở lần nộp cuối.
### Hoạt động
#### Đăng nhập
Người dùng đăng nhập vào tài khoản của mình, chọn role (sinh viên) và chọn chủ đề (topic) để nộp bài. <br>
Riêng đối với role (giảng viên) sau khi đăng nhập sẽ có thể tạo chủ đề và gửi dự án đối chiếu.
#### Nộp dự án
Mỗi người dùng đều được tạo một folder riêng để lưu thông tin cá nhân và các chủ đề theo dạng:<br>
<Người dùng>
    -<Tên chủ đề>
        --<Tên Bài nộp : <Ngày-tháng-năm GiờPhútGiây>>
Các lần nộp tiếp theo sẽ tiếp tục tạo ra các thư mục bài nộp khác. Hệ thống sẽ tìm bài nộp gần nhất là lưu thành thư mục lấy điểm.
#### Tạo dự án đối chiếu
Người dùng đăng nhập vào role giảng viên sẽ có thể tạo chủ đề vào tạo dự án đối chiếu. Tương tự với Role sinh viên thì thông tin của cá nhân của giảng viên cũng có cấu trúc như trên và người dùng có thể chọn thư mục để đối chiếu.
#### Đối chiếu kết quả
1. Dự án mẫu sẽ được biên dịch và thực thi để sinh ra kết quả tự động ngay sau khi giảng viên chọn thư mục để đối chiếu.
2. Việc đối chiếu sẽ được thực hiện bằng hàm chuyên biệt để so sánh kết quả người nộp và kết quả đối chiếu.
3. Yêu cầu kết quả của người nộp có đúng định dạng với kết quả đối chiếu
#### Độ sai lệch
Khả năng sai lệch chấp nhận được của kết quả đối chiếu và kết quả nộp là 0.01%.
#### Tính điểm
Điểm tối đa là 10, điểm thấp nhất là 1.<br>
Cơ chế tính điểm được dựa vào độ sai lệch của kết quả nộp, do giảng viên tùy chỉnh.
#### Trả điểm
Điểm của người nộp sẽ liên tục được cập nhật và được ghi vào file excel. <br>
Người dùng sinh viên sẽ vào chủ đề nộp, trong mục điểm để xem điểm các bài nộp của mình.<br>
Để xem điểm của tất cả người nộp (tức điểm của lần nộp cuối cùng), sẽ có mục điểm của tất cả mọi người.
#### Lưu dữ liệu
Các kết quả của người nộp sẽ được giải phóng khi giảng viên đóng chủ đề lại. Các điểm sẽ được bảo lưu.

## Giao diện
Giao diện là tính năng mở rộng...
