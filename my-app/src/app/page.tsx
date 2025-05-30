import UserProfileForm from '@/components/UserProfileForm';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-100">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-indigo-700">User Profile Management</h1>
        <UserProfileForm />
      </div>
    </main>
  );
}
