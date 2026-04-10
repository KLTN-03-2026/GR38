import { useState } from "react"
import Errors from "./Errors";
import { Link, Navigate, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

function DangKi() {
    const [input, getInput] = useState({
        email: "",
        pass: "",
        ho: "",
        ten: ""
    });
    const [errors, setErrors] = useState("");
    const Navigate = useNavigate();
    const handleInput = (e) => {
        const NameInput = e.target.name;
        const value = e.target.value;
        getInput(state => ({ ...state, [NameInput]: value }))
    }
    function handleSubmit(e) {
        console.log(input)
        let errorsSubmit = {};
        e.preventDefault();
        let Flag = true;
        if (input.email == "") {
            errorsSubmit.email = "Vui lòng nhập Email";
            Flag = false;
        }
        if (input.pass == "") {
            errorsSubmit.pass = "Vui lòng nhập Mật Khẩu";
            Flag = false;
        }
        if (input.ho == "") {
            errorsSubmit.ho = "Vui lòng nhập Họ";
            Flag = false;
        }
        if (input.ten == "") {
            errorsSubmit.ten = "Vui lòng nhập Tên";
            Flag = false;
        }
        if (!Flag) {
            setErrors(errorsSubmit);
        } else {
            const user = {
                email: input.email,
                pass: input.pass,
                ho: input.ho,
                ten: input.ten
            }
            const newUser = JSON.stringify(user);
            localStorage.setItem('users', newUser)
            Swal.fire({
                icon: 'success',
                title: 'Đăng Ký thành công',
                text: 'Chào mừng bạn đến với Lịch Sử Việt Nam !',
                confirmButtonColor: '#3085d6'
            });
            Navigate('/');
        }
    }
    return (
        <div>
            {/* Navbar */}
            <nav>
                <a href="#" className="nav-brand">
                    <img src="/Logo.jpg" alt="logo" className="logo-img" />
                    <span>Lịch sử Việt Nam</span>
                </a>
                <div className="nav-actions">
                    <button className="btn-primary"><Link to="/register">Đăng ký</Link></button>
                    <button className="btn-outline"><Link to="/">Đăng nhập</Link></button>
                </div>
            </nav>
            {/* Main */}
            <div className="page-body">
                <div className="card">
                    <h1 className="card-title">Đăng ký</h1>
                    <p className="card-subtitle">Đăng ký để kết nối với chúng tôi</p>
                    <div>
                        <Errors errors={errors} />
                        <form onSubmit={handleSubmit}>
                            {/* Họ & Tên */}
                            <div className="row-2">
                                <div>
                                    <div className="field-header">
                                        <label htmlFor="ho">Họ <span className="required">*</span></label>
                                    </div>
                                    <input type="text" id="ho" name="ho" onChange={handleInput} placeholder="Nguyễn Văn" />
                                </div>
                                <div>
                                    <div className="field-header">
                                        <label htmlFor="ten">Tên <span className="required">*</span></label>
                                    </div>
                                    <input type="text" id="ten" name="ten" onChange={handleInput} placeholder="A" />
                                </div>
                            </div>
                            {/* Email */}
                            <div className="field">
                                <div className="field-header">
                                    <label htmlFor="email">Email <span className="required">*</span></label>
                                </div>
                                <input type="email" id="email" name="email" onChange={handleInput} placeholder="m@example.com" autoComplete="email" />
                            </div>
                            {/* Mật khẩu */}
                            <div className="field">
                                <div className="field-header">
                                    <label htmlFor="password">Mật khẩu <span className="required">*</span></label>
                                </div>
                                <input type="password" id="password" name="pass" onChange={handleInput} autoComplete="new-password" />
                            </div>
                            <button type="submit" className="btn-register">Đăng ký</button>
                        </form>
                    </div>

                    <p className="divider">HOẶC</p>
                    <button type="button" className="btn-gmail">
                        <svg width={18} height={18} viewBox="0 0 48 48">
                            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                        </svg>
                        Đăng ký với Gmail
                    </button>
                    <p className="login-link">Bạn đã có tài khoản? <Link to="/">Đăng Nhập</Link></p>
                </div>
            </div>
        </div>
    )
}
export default DangKi