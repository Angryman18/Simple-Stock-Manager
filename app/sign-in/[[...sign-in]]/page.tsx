import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className='flex min-h-screen items-center justify-center'>
      <SignIn
        appearance={{
          elements: {
            formButtonPrimary: "bg-black hover:bg-gray-800 text-white",
            card: "shadow-lg",
          },
        }}
      />
    </div>
  );
}
