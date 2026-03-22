import type {
  ProviderPresetModel,
  ProviderVendor,
} from '@opencopilot/shared/bridge'
import { providerTemplates } from '@opencopilot/shared/bridge'
import {
  Eye,
  EyeOff,
  Info,
  Network,
  PlugZap,
  Shapes,
  ShieldCheck,
} from 'lucide-react'
import type { FormEvent } from 'react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
  FieldLegend,
} from '@/components/ui/field'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'
import { getTemplate } from './provider-config'
import type { ProviderFormState } from './provider-config'

export interface ProviderSetupCardProps {
  form: ProviderFormState
  isSubmitting: boolean
  isTestingConnection: boolean
  isApiKeyVisible: boolean
  errorMessage: string
  infoMessage: string
  onVendorChange: (vendor: ProviderVendor) => void
  onFieldChange: (field: 'name' | 'baseUrl' | 'apiKey', value: string) => void
  onPresetModelToggle: (modelId: string, enabled: boolean) => void
  onToggleApiKeyVisibility: () => void
  onTestConnection: () => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onCancel?: () => void
  submitLabel: string
}

function groupPresetModels(models: readonly ProviderPresetModel[]): Array<{
  title: string
  models: readonly ProviderPresetModel[]
}> {
  const grouped = new Map<string, ProviderPresetModel[]>()

  models.forEach((model) => {
    const currentGroup = grouped.get(model.useCase) ?? []
    currentGroup.push(model)
    grouped.set(model.useCase, currentGroup)
  })

  return Array.from(grouped.entries()).map(([title, items]) => ({
    title,
    models: items,
  }))
}

function ModelCheckbox({
  model,
  enabled,
  onToggle,
}: {
  model: ProviderPresetModel
  enabled: boolean
  onToggle: (enabled: boolean) => void
}): React.JSX.Element {
  const checkboxId = `model-${model.id}`

  return (
    <Field
      orientation="horizontal"
      className={cn(
        'rounded-2xl border px-4 py-4 transition-colors',
        enabled
          ? 'border-primary/30 bg-primary/10'
          : 'border-border/60 bg-background/70 hover:border-primary/20 hover:bg-background',
      )}
    >
      <Checkbox
        id={checkboxId}
        checked={enabled}
        onCheckedChange={(checked) => onToggle(Boolean(checked))}
        className="mt-1"
      />
      <FieldContent className="gap-1">
        <FieldLabel htmlFor={checkboxId} className="text-sm font-medium">
          {model.label}
        </FieldLabel>
        <FieldDescription className="leading-6">
          {model.description}
        </FieldDescription>
        <div className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
          {model.id}
        </div>
      </FieldContent>
    </Field>
  )
}

export function ProviderSetupCard({
  form,
  isSubmitting,
  isTestingConnection,
  isApiKeyVisible,
  errorMessage,
  infoMessage,
  onVendorChange,
  onFieldChange,
  onPresetModelToggle,
  onToggleApiKeyVisibility,
  onTestConnection,
  onSubmit,
  onCancel,
  submitLabel,
}: ProviderSetupCardProps): React.JSX.Element {
  const template = getTemplate(form.vendor)
  const modelGroups = groupPresetModels(template.presetModels)
  const enabledGroupsCount = modelGroups.filter((group) =>
    group.models.some((model) => form.selectedModels.includes(model.id)),
  ).length
  const sectionClassName =
    'rounded-[1.75rem] border border-border/65 bg-background/80 p-5 shadow-[0_18px_50px_-40px_rgba(15,23,42,0.16)] backdrop-blur-sm'

  return (
    <Card className="w-full overflow-hidden rounded-[2rem] border border-border/70 bg-background/88 py-0 shadow-[0_32px_90px_-48px_rgba(15,23,42,0.18)] backdrop-blur-sm">
      <CardHeader className="border-b border-border/60 px-6 py-6 sm:px-8 sm:py-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-3">
            <Badge
              variant="outline"
              className="rounded-full border-border/60 bg-background/70 px-3 py-1 text-[0.7rem] uppercase tracking-[0.24em] text-muted-foreground"
            >
              Provider Setup
            </Badge>
            <CardTitle className="text-3xl sm:text-4xl">设置模型服务</CardTitle>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="rounded-full px-3 py-1">
              {template.label}
            </Badge>
            <Badge variant="outline" className="rounded-full px-3 py-1">
              {form.selectedModels.length} 个模型待启用
            </Badge>
          </div>
        </div>
        <CardDescription>
          把可用模型接入到 OpenCopilot。完成后，首页就会直接开放发送与切换模型。
        </CardDescription>
      </CardHeader>

      <CardContent className="px-6 py-6 sm:px-8 sm:py-7">
        <form className="flex flex-col gap-6" onSubmit={onSubmit}>
          <div className="grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
            <aside className="flex flex-col gap-4">
              <section className={sectionClassName}>
                <div className="mb-4 flex items-center gap-2 text-sm font-medium text-foreground">
                  <Shapes className="size-4 text-primary" />
                  供应商
                </div>

                <FieldGroup className="gap-4">
                  <Field>
                    <FieldLabel htmlFor="provider-vendor">模型服务</FieldLabel>
                    <Select
                      value={form.vendor}
                      onValueChange={(value) =>
                        onVendorChange(value as ProviderVendor)
                      }
                    >
                      <SelectTrigger
                        id="provider-vendor"
                        className="h-11 rounded-2xl border-border/70 bg-background/80"
                      >
                        <SelectValue placeholder="选择供应商" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {providerTemplates.map((item) => (
                            <SelectItem key={item.vendor} value={item.vendor}>
                              {item.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <FieldDescription className="leading-6">
                      {template.description}
                    </FieldDescription>
                  </Field>
                </FieldGroup>

                <div className="mt-5 grid gap-3">
                  <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                    <div className="text-sm font-medium text-foreground">
                      当前模板
                    </div>
                    <div className="mt-1 text-sm leading-6 text-muted-foreground">
                      {template.label}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                      <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                        已选模型
                      </div>
                      <div className="mt-2 text-2xl font-semibold text-foreground">
                        {form.selectedModels.length}
                      </div>
                    </div>
                    <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                      <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                        使用场景
                      </div>
                      <div className="mt-2 text-2xl font-semibold text-foreground">
                        {enabledGroupsCount}
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section className={sectionClassName}>
                <div className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
                  <ShieldCheck className="size-4 text-primary" />
                  配置提醒
                </div>
                <div className="space-y-3 text-sm leading-6 text-muted-foreground">
                  <p>
                    名称只用于你自己区分不同服务，建议用容易记住的工作场景命名。
                  </p>
                  <p>
                    接口地址会自动带入推荐值，只有使用自定义网关时才需要修改。
                  </p>
                  <p>先检测连接，再保存配置，能更快确认哪些模型真的可用。</p>
                </div>
              </section>
            </aside>

            <div className="flex flex-col gap-6">
              <section className={sectionClassName}>
                <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <PlugZap className="size-4 text-primary" />
                      连接信息
                    </div>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      保存前可以先验证 API Key 与模型连通性。
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className="rounded-full bg-background/70 px-3 py-1"
                  >
                    {template.defaultBaseUrl}
                  </Badge>
                </div>

                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="provider-name">配置名称</FieldLabel>
                    <InputGroup className="h-11 rounded-2xl border-border/70 bg-background/80">
                      <InputGroupInput
                        id="provider-name"
                        value={form.name}
                        onChange={(event) =>
                          onFieldChange('name', event.target.value)
                        }
                        placeholder={`例如：${template.label} Workspace`}
                      />
                    </InputGroup>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="provider-api-key">API Key</FieldLabel>
                    <InputGroup className="h-11 rounded-2xl border-border/70 bg-background/80">
                      <InputGroupInput
                        id="provider-api-key"
                        value={form.apiKey}
                        type={isApiKeyVisible ? 'text' : 'password'}
                        onChange={(event) =>
                          onFieldChange('apiKey', event.target.value)
                        }
                        placeholder={template.apiKeyPlaceholder}
                      />
                      <InputGroupAddon align="inline-end">
                        <InputGroupButton
                          aria-label={
                            isApiKeyVisible ? '隐藏 API Key' : '显示 API Key'
                          }
                          onClick={onToggleApiKeyVisibility}
                          size="icon-sm"
                        >
                          {isApiKeyVisible ? <EyeOff /> : <Eye />}
                        </InputGroupButton>
                      </InputGroupAddon>
                    </InputGroup>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="provider-base-url">
                      接口地址
                    </FieldLabel>
                    <InputGroup className="h-11 rounded-2xl border-border/70 bg-background/80">
                      <InputGroupInput
                        id="provider-base-url"
                        value={form.baseUrl}
                        onChange={(event) =>
                          onFieldChange('baseUrl', event.target.value)
                        }
                        placeholder={template.baseUrlPlaceholder}
                      />
                    </InputGroup>
                    <FieldDescription className="leading-6">
                      请求地址预览：{form.baseUrl || template.defaultBaseUrl}
                      /chat/completions
                    </FieldDescription>
                  </Field>
                </FieldGroup>

                <div className="mt-5 flex flex-wrap gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isSubmitting}
                    className="h-10 rounded-full px-4"
                    onClick={onTestConnection}
                  >
                    {isTestingConnection ? (
                      <Spinner data-icon="inline-start" />
                    ) : (
                      <Network data-icon="inline-start" />
                    )}
                    检测连接
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    className="h-10 rounded-full px-4"
                    onClick={() =>
                      onFieldChange('baseUrl', template.defaultBaseUrl)
                    }
                  >
                    恢复默认地址
                  </Button>
                </div>
              </section>

              <section className={sectionClassName}>
                <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-medium text-foreground">
                      启用模型
                    </div>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      至少启用一个模型，保存时会校验当前启用项。
                    </p>
                  </div>
                  <Badge variant="secondary" className="rounded-full px-3 py-1">
                    {template.presetModels.length} 个可选模型
                  </Badge>
                </div>

                <div className="grid gap-4">
                  {modelGroups.map((group) => {
                    const enabledCount = group.models.filter((model) =>
                      form.selectedModels.includes(model.id),
                    ).length

                    return (
                      <section
                        key={group.title}
                        className="rounded-[1.5rem] border border-border/60 bg-background/70 p-4"
                      >
                        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <h3 className="text-base font-medium text-foreground">
                              {group.title}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              已启用 {enabledCount} / {group.models.length}
                            </p>
                          </div>
                          <Badge
                            variant={enabledCount > 0 ? 'secondary' : 'outline'}
                            className="rounded-full px-3 py-1"
                          >
                            {enabledCount > 0 ? '已选择' : '未选择'}
                          </Badge>
                        </div>
                        <FieldSet className="gap-3">
                          <FieldLegend className="sr-only">
                            {group.title}
                          </FieldLegend>
                          {group.models.map((model) => (
                            <ModelCheckbox
                              key={model.id}
                              model={model}
                              enabled={form.selectedModels.includes(model.id)}
                              onToggle={(enabled) =>
                                onPresetModelToggle(model.id, enabled)
                              }
                            />
                          ))}
                        </FieldSet>
                      </section>
                    )
                  })}
                </div>
              </section>
            </div>
          </div>

          {errorMessage ? (
            <Alert
              variant="destructive"
              className="rounded-[1.5rem] border-destructive/25 bg-destructive/8"
            >
              <Info />
              <AlertTitle>配置失败</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          ) : null}

          {infoMessage ? (
            <Alert className="rounded-[1.5rem] border-border/65 bg-background/75">
              <Info />
              <AlertTitle>当前状态</AlertTitle>
              <AlertDescription>{infoMessage}</AlertDescription>
            </Alert>
          ) : null}

          <CardFooter className="flex flex-wrap justify-between gap-4 border-0 bg-transparent p-0">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="rounded-full px-3 py-1">
                {template.label}
              </Badge>
              <Badge variant="secondary" className="rounded-full px-3 py-1">
                {form.selectedModels.length} 个模型已启用
              </Badge>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                type="submit"
                disabled={isTestingConnection}
                className="h-11 rounded-full px-5"
              >
                {isSubmitting ? <Spinner data-icon="inline-start" /> : null}
                {submitLabel}
              </Button>

              {onCancel ? (
                <Button
                  type="button"
                  variant="ghost"
                  className="h-11 rounded-full px-4"
                  onClick={onCancel}
                >
                  稍后再说
                </Button>
              ) : null}
            </div>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  )
}
