import { useState } from 'react'
import { TargetRole } from '@/types/funding'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { NativeSelect } from '@/components/ui/NativeSelect'
import { X, Plus } from 'lucide-react'

interface RoleMultiSelectProps {
  selectedRoles?: TargetRole[]
  customRoles?: string[]
  onRolesChange: (roles: TargetRole[]) => void
  onCustomRolesChange: (roles: string[]) => void
  error?: string
}

const ROLE_OPTIONS = [
  { value: TargetRole.PRODUCER, label: 'Producer' },
  { value: TargetRole.DIRECTOR, label: 'Director' },
  { value: TargetRole.WRITER, label: 'Writer' },
  { value: TargetRole.ACTRESS, label: 'Actress' },
  { value: TargetRole.CREW, label: 'Crew' },
  { value: TargetRole.BUSINESS, label: 'Business' },
  { value: TargetRole.ALL, label: 'All Roles' },
]

export function RoleMultiSelect({
  selectedRoles = [],
  customRoles = [],
  onRolesChange,
  onCustomRolesChange,
  error,
}: RoleMultiSelectProps) {
  const [showCustomInput, setShowCustomInput] = useState(customRoles.length > 0)
  const [customRoleInput, setCustomRoleInput] = useState('')
  const [dropdownValue, setDropdownValue] = useState('')

  const handleAddRole = () => {
    if (dropdownValue && !selectedRoles.includes(dropdownValue as TargetRole)) {
      onRolesChange([...selectedRoles, dropdownValue as TargetRole])
      setDropdownValue('')
    }
  }

  const handleRemoveRole = (role: TargetRole) => {
    onRolesChange(selectedRoles.filter((r) => r !== role))
  }

  const handleAddCustomRole = () => {
    const trimmed = customRoleInput.trim()
    if (trimmed && trimmed.length <= 50 && !customRoles.includes(trimmed)) {
      onCustomRolesChange([...customRoles, trimmed])
      setCustomRoleInput('')
    }
  }

  const handleRemoveCustomRole = (index: number) => {
    onCustomRolesChange(customRoles.filter((_, i) => i !== index))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddCustomRole()
    }
  }

  // Get available options (not already selected)
  const availableOptions = ROLE_OPTIONS.filter(
    (option) => !selectedRoles.includes(option.value)
  )

  return (
    <div className="space-y-4">
      {/* Dropdown to add roles */}
      <div className="flex gap-2">
        <div className="flex-1">
          <NativeSelect
            value={dropdownValue}
            onChange={(e) => setDropdownValue(e.target.value)}
            className="w-full"
          >
            <option value="">Select a role...</option>
            {availableOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </NativeSelect>
        </div>
        <Button
          type="button"
          onClick={handleAddRole}
          disabled={!dropdownValue}
          size="sm"
          className="gap-1"
        >
          <Plus className="w-4 h-4" />
          Add
        </Button>
      </div>

      {/* Selected Roles Display */}
      {selectedRoles.length > 0 && (
        <div className="space-y-2">
          <span className="text-xs text-muted-foreground">Selected Roles:</span>
          <div className="flex flex-wrap gap-2">
            {selectedRoles.map((role) => (
              <Badge key={role} variant="secondary" className="gap-1">
                {ROLE_OPTIONS.find((r) => r.value === role)?.label}
                <button
                  type="button"
                  onClick={() => handleRemoveRole(role)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Others Checkbox */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="show-custom-roles"
          checked={showCustomInput}
          onChange={(e) => {
            setShowCustomInput(e.target.checked)
            if (!e.target.checked) {
              onCustomRolesChange([])
              setCustomRoleInput('')
            }
          }}
          className="w-4 h-4 text-primary border-input rounded focus:ring-ring focus:ring-2"
        />
        <label htmlFor="show-custom-roles" className="text-sm font-medium cursor-pointer">
          Others (specify custom roles)
        </label>
      </div>

      {/* Custom Roles Input */}
      {showCustomInput && (
        <div className="space-y-3 pl-6 border-l-2 border-border">
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                type="text"
                value={customRoleInput}
                onChange={(e) => setCustomRoleInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="e.g. Film Distributor, Festival Curator"
                maxLength={50}
                className="text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {customRoleInput.length}/50 characters
              </p>
            </div>
            <Button
              type="button"
              onClick={handleAddCustomRole}
              disabled={!customRoleInput.trim() || customRoleInput.length > 50}
              size="sm"
              className="gap-1"
            >
              <Plus className="w-4 h-4" />
              Add
            </Button>
          </div>

          {/* Custom Roles Display */}
          {customRoles.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs text-muted-foreground">Custom Roles:</span>
              <div className="flex flex-wrap gap-2">
                {customRoles.map((role, index) => (
                  <Badge key={index} variant="outline" className="gap-1">
                    {role}
                    <button
                      type="button"
                      onClick={() => handleRemoveCustomRole(index)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
