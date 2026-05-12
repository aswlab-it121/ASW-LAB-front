import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Input } from '../../../components/ui/Input'
import { Button } from '../../../components/ui/Button'
import { issuesApi } from '../api/issuesApi'
import { useNavigate } from 'react-router-dom'

const IssueSchema = z.object({
  subject: z.string().min(3),
  description: z.string().optional()
})

type FormData = z.infer<typeof IssueSchema>

const IssueNewPage: React.FC = () => {
  const { register, handleSubmit } = useForm<FormData>({ resolver: zodResolver(IssueSchema) })
  const nav = useNavigate()

  async function onSubmit(values: FormData) {
    try {
      await issuesApi.create(values as any)
      nav('/issues')
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="max-w-xl bg-white p-4 rounded-md border">
      <h2 className="text-lg font-semibold mb-3">Create Issue</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div>
          <label className="block text-sm">Subject</label>
          <Input {...register('subject')} />
        </div>
        <div>
          <label className="block text-sm">Description</label>
          <textarea {...register('description')} className="w-full border rounded-md p-2 min-h-[120px]" />
        </div>
        <div className="flex gap-2">
          <Button type="submit">Create</Button>
        </div>
      </form>
    </div>
  )
}

export default IssueNewPage
