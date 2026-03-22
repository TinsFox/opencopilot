import { useNavigate } from '@tanstack/react-router'
import { ArrowRight, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react'
import type { FormEvent } from 'react'
import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import type { ProviderFormState } from './provider-config'
import {
  buildCreateProviderRequest,
  createInitialProviderForm,
} from './provider-config'
import { ProviderSetupCard } from './provider-setup-card'

const SETUP_DISMISSED_KEY = 'opencopilot.setup.dismissed'

const setupHighlights = [
  '先选择供应商，系统会自动带入默认地址和推荐模型。',
  '保存前可先检测连接，避免配置完成后才发现不可用。',
  '至少启用一个模型，首页才会开放发送功能。',
] as const

export function ProviderSetupPage(): React.JSX.Element {
  const navigate = useNavigate()
  const [providerForm, setProviderForm] = useState<ProviderFormState>(() =>
    createInitialProviderForm(),
  )
  const [providerErrorMessage, setProviderErrorMessage] = useState('')
  const [providerInfoMessage, setProviderInfoMessage] = useState('')
  const [isCreatingProvider, setIsCreatingProvider] = useState(false)
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [isApiKeyVisible, setIsApiKeyVisible] = useState(false)

  const handleProviderVendorChange = (
    vendor: ProviderFormState['vendor'],
  ): void => {
    setProviderForm(createInitialProviderForm(vendor))
    setProviderErrorMessage('')
    setProviderInfoMessage('')
  }

  const handleProviderFieldChange = (
    field: 'name' | 'baseUrl' | 'apiKey',
    value: string,
  ): void => {
    setProviderForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }))
  }

  const validateProviderForm = (): boolean => {
    if (!providerForm.name.trim()) {
      setProviderErrorMessage('先给这个模型服务起一个名字。')
      return false
    }

    if (!providerForm.baseUrl.trim()) {
      setProviderErrorMessage('请输入接口地址。')
      return false
    }

    if (!providerForm.apiKey.trim()) {
      setProviderErrorMessage('请输入 API Key。')
      return false
    }

    if (providerForm.selectedModels.length === 0) {
      setProviderErrorMessage('至少选择一个模型，才能继续。')
      return false
    }

    return true
  }

  const handlePresetModelToggle = (modelId: string, enabled: boolean): void => {
    setProviderForm((currentForm) => ({
      ...currentForm,
      selectedModels: enabled
        ? Array.from(new Set([...currentForm.selectedModels, modelId]))
        : currentForm.selectedModels.filter((item) => item !== modelId),
    }))
  }

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault()
    setProviderErrorMessage('')
    setProviderInfoMessage('')

    if (!validateProviderForm()) {
      return
    }

    setIsCreatingProvider(true)

    try {
      const result = await window.opencopilot.providers.createProvider(
        buildCreateProviderRequest(providerForm),
      )
      window.localStorage.removeItem(SETUP_DISMISSED_KEY)
      setProviderInfoMessage(
        result.failedModels.length > 0
          ? `配置已保存，但以下模型暂时无法使用：${result.failedModels
              .map((model) => model.name)
              .join('、')}。`
          : '配置已保存，现在可以开始第一次对话了。',
      )
      await navigate({ to: '/' })
    } catch (error) {
      setProviderErrorMessage(
        error instanceof Error ? error.message : '保存失败，请稍后再试。',
      )
    } finally {
      setIsCreatingProvider(false)
    }
  }

  const handleTestConnection = async (): Promise<void> => {
    setProviderErrorMessage('')
    setProviderInfoMessage('')

    if (!validateProviderForm()) {
      return
    }

    setIsTestingConnection(true)

    try {
      const result = await window.opencopilot.providers.testConnection(
        buildCreateProviderRequest(providerForm),
      )

      if (result.successfulModels.length === 0) {
        setProviderErrorMessage(
          result.failedModels[0]?.error ?? '没有模型通过连通性测试。',
        )
        return
      }

      setProviderInfoMessage(
        result.failedModels.length > 0
          ? `连接正常，已验证可用的模型：${result.successfulModels.join('、')}。以下模型暂时不可用：${result.failedModels
              .map((model) => model.name)
              .join('、')}。`
          : `连接正常，已验证可用的模型：${result.successfulModels.join('、')}。`,
      )
    } catch (error) {
      setProviderErrorMessage(
        error instanceof Error ? error.message : '测试失败，请稍后再试。',
      )
    } finally {
      setIsTestingConnection(false)
    }
  }

  const handleSkip = async (): Promise<void> => {
    window.localStorage.setItem(SETUP_DISMISSED_KEY, '1')
    await navigate({ to: '/' })
  }

  return (
    <main className="min-h-screen px-4 py-4 text-foreground sm:px-6 sm:py-6">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-7xl items-center">
        <section className="grid w-full gap-6 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
          <article className="relative overflow-hidden rounded-[2rem] border border-border/70 bg-background/85 p-6 shadow-[0_32px_90px_-48px_rgba(15,23,42,0.18)] backdrop-blur-sm sm:p-8">
            <div className="absolute right-[-5rem] top-[-4rem] h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute bottom-[-7rem] left-[-4rem] h-56 w-56 rounded-full bg-accent/35 blur-3xl" />

            <div className="relative flex h-full flex-col justify-between gap-8">
              <div className="space-y-6">
                <Badge
                  variant="outline"
                  className="rounded-full border-border/60 bg-background/70 px-3 py-1 text-[0.7rem] uppercase tracking-[0.24em] text-muted-foreground"
                >
                  First Run
                </Badge>

                <div className="space-y-4">
                  <h1 className="max-w-xl font-heading text-[clamp(2.5rem,5vw,4.6rem)] leading-[0.95] tracking-tight text-foreground">
                    先完成一次连接，后面就只需要提问。
                  </h1>
                  <p className="max-w-lg text-base leading-7 text-muted-foreground">
                    OpenCopilot
                    把模型接入过程收敛成一个清楚的入口。你只需要确认服务、填入密钥、勾选模型，保存后就能直接回到首页开始使用。
                  </p>
                </div>

                <div className="grid gap-3">
                  {setupHighlights.map((item, index) => (
                    <div
                      key={item}
                      className="flex items-start gap-3 rounded-2xl border border-border/55 bg-background/70 px-4 py-4"
                    >
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/12 text-sm font-semibold text-primary">
                        {index + 1}
                      </div>
                      <p className="text-sm leading-6 text-foreground/82">
                        {item}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-3 xl:grid-cols-1">
                <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                  <div className="mb-2 flex items-center gap-2 text-foreground">
                    <Sparkles className="size-4 text-primary" />
                    配置目标
                  </div>
                  <p className="leading-6">
                    用任务语言组织设置流程，而不是把用户丢进术语堆里。
                  </p>
                </div>
                <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                  <div className="mb-2 flex items-center gap-2 text-foreground">
                    <ShieldCheck className="size-4 text-primary" />
                    安全感
                  </div>
                  <p className="leading-6">
                    提前检测连接状态，减少保存后反复排查的挫败感。
                  </p>
                </div>
                <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                  <div className="mb-2 flex items-center gap-2 text-foreground">
                    <CheckCircle2 className="size-4 text-primary" />
                    结果导向
                  </div>
                  <p className="leading-6">
                    保存完成后直接回到首页，立即开始第一轮对话。
                  </p>
                </div>
              </div>
            </div>
          </article>

          <div className="flex flex-col gap-4">
            <ProviderSetupCard
              form={providerForm}
              isSubmitting={isCreatingProvider}
              isTestingConnection={isTestingConnection}
              isApiKeyVisible={isApiKeyVisible}
              errorMessage={providerErrorMessage}
              infoMessage={providerInfoMessage}
              onVendorChange={handleProviderVendorChange}
              onFieldChange={handleProviderFieldChange}
              onPresetModelToggle={handlePresetModelToggle}
              onToggleApiKeyVisibility={() =>
                setIsApiKeyVisible((current) => !current)
              }
              onTestConnection={() => {
                void handleTestConnection()
              }}
              onSubmit={(event) => {
                void handleSubmit(event)
              }}
              onCancel={() => {
                void handleSkip()
              }}
              submitLabel="保存配置"
            />
            <div className="flex items-center justify-center gap-2 px-2 text-sm text-muted-foreground xl:hidden">
              稍后再设置也可以，首页仍然会保留入口。
              <ArrowRight className="size-4" />
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
