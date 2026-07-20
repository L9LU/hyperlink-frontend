import authIllustration from '../assets/auth-illustration.png';

const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen w-full flex">
      {/* Left panel — illustration side */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <img
          src={authIllustration}
          alt=""
          className="w-full h-full object-cover"
        />
      </div>

      {/* Right panel — content card */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white p-6">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;