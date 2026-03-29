import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export default async function Page() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  if (!supabase) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4 text-red-600">Configuration Error</h1>
        <p>Your Supabase environment variables are missing. Please add them to your Vercel project settings.</p>
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <p className="font-mono">NEXT_PUBLIC_SUPABASE_URL</p>
          <p className="font-mono">NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY</p>
        </div>
      </div>
    )
  }

  const { data: todos, error } = await supabase.from('todos').select()

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Todo List</h1>
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded text-yellow-700">
          <p className="font-semibold mb-2">Error loading todos:</p>
          <p>{error.message}</p>
          <p className="mt-2 text-sm">Note: Make sure you have a "todos" table in your Supabase project.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Todo List</h1>
      <ul className="list-disc pl-5">
        {todos?.map((todo: any) => (
          <li key={todo.id}>{todo.name}</li>
        ))}
        {(!todos || todos.length === 0) && <p>No todos found. Try adding some to your database!</p>}
      </ul>
    </div>
  )
}
