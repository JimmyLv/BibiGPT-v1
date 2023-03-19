import React from 'react'
import { Label } from '~/components/ui/label'
import { Switch } from '~/components/ui/switch'

export function SwitchItem(props: {
  checked: undefined | boolean
  onCheckedChange: (checked: boolean) => void
  title: string
  id: string
}) {
  return (
    <div className="flex items-center justify-end space-x-2">
      <Switch id={props.id} checked={props.checked} onCheckedChange={props.onCheckedChange} />
      <Label htmlFor={props.id}>{props.title}</Label>
    </div>
  )
}
