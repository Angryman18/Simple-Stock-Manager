"use client";

import { UserButton } from "@clerk/nextjs";

export function UserButtonComponent() {
  return (
    <div className='fixed top-4 right-4 z-50'>
      <UserButton
        appearance={{
          elements: {
            avatarBox: "w-10 h-10",
          },
        }}
      />
    </div>
  );
}
