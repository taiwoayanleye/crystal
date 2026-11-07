'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ThemeToggle } from '@/components/ThemeToggle'

interface LandingDataset {
  qualityScore: number
  rowCount: number
}

const REPOSITORY_URL = 'https://github.com/taiwoayanleye/crystal'

function formatRows(value: number) {
  if (value >= 1000) return `${Math.floor(value / 1000)}K+`
  return value.toLocaleString()
}

export default function HomePage() {
  const [datasets, setDatasets] = useState<LandingDataset[] | null>(null)

  useEffect(() => {
    let active = true
    fetch('/api/datasets')
      .then((response) => {
        if (!response.ok) throw new Error('Could not load portfolio stats')
        return response.json()
      })
      .then((items: LandingDataset[]) => {
        if (active) setDatasets(items)
      })
      .catch(() => {
        if (active) setDatasets([])
      })
    return () => {
      active = false
    }
  }, [])

  const dataProductCount = datasets?.length ?? null
  const averageQuality = datasets?.length
    ? Math.round(datasets.reduce((sum, item) => sum + item.qualityScore, 0) / datasets.length)
    : datasets ? 0 : null
  const rowsManaged = datasets
    ? formatRows(datasets.reduce((sum, item) => sum + item.rowCount, 0))
    : null

  const stats = [
    { value: dataProductCount === null ? '—' : String(dataProductCount), label: 'Data products' },
    { value: averageQuality === null ? '—' : `${averageQuality}%`, label: 'Avg. quality estimate' },
    { value: rowsManaged ?? '—', label: 'Rows managed' },
  ]

  return (
    <main className="flex min-h-screen flex-col bg-bg-base text-text-primary">
      <header className="flex h-[72px] shrink-0 items-center justify-between border-b border-border-subtle bg-surface px-5 sm:px-8 lg:px-12">
        <Link href="/" className="flex items-center gap-2.5" aria-label="Crystal homepage">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-accent font-heading text-lg text-white" aria-hidden="true">◇</span>
          <span className="font-heading text-xl font-semibold tracking-tight">Crystal</span>
        </Link>

        <nav aria-label="Main navigation" className="flex items-center gap-4 text-xs text-text-secondary sm:gap-7 sm:text-sm">
          <a href={`${REPOSITORY_URL}#readme`} className="hidden transition-colors hover:text-text-primary sm:inline">Docs</a>
          <a href={REPOSITORY_URL} className="hidden transition-colors hover:text-text-primary sm:inline">GitHub</a>
          <a href={`${REPOSITORY_URL}/commits/main/`} className="hidden transition-colors hover:text-text-primary md:inline">Changelog</a>
          <ThemeToggle />
          <Link href="/dashboard" className="rounded-md bg-accent px-3.5 py-2 font-medium text-white transition-colors hover:bg-accent-light sm:px-5">
            Open Dashboard
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center px-5 py-16 text-center sm:px-8 sm:py-24">
        <div className="flex w-full max-w-4xl flex-col items-center gap-6 sm:gap-8">
          <p className="font-mono text-[10px] font-medium tracking-[0.2em] text-text-secondary sm:text-xs">
            DATA-AS-A-PRODUCT PLATFORM
          </p>
          <h1 className="whitespace-pre-line font-heading text-[44px] font-bold leading-[1.02] tracking-[-0.045em] text-text-primary sm:text-6xl lg:text-[72px]">
            {'Turn raw data\ninto products.'}
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-text-secondary sm:text-lg sm:leading-7">
            Connect any data source. Autofill with AI. Schedule refreshes. Track quality & outcomes.
            <br className="hidden sm:block" /> One platform for teams that ship data.
          </p>

          <div className="mt-2 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center">
            <Link href="/dashboard" className="inline-flex items-center justify-center gap-3 rounded-lg bg-accent px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-accent-light sm:px-7">
              Go to Dashboard <span aria-hidden="true">→</span>
            </Link>
            <a href={`${REPOSITORY_URL}#readme`} className="inline-flex items-center justify-center rounded-lg border border-border-default bg-surface px-6 py-3.5 text-sm font-medium text-text-primary transition-colors hover:bg-bg-elevated sm:px-7">
              View Docs
            </a>
          </div>

          <div aria-label="Portfolio snapshot" className="mt-8 flex w-full max-w-[600px] items-center justify-center divide-x divide-border-default border-t border-border-subtle pt-8 sm:mt-12 sm:pt-10">
            {stats.map((stat) => (
              <div key={stat.label} className="flex min-w-0 flex-1 flex-col items-center gap-1 px-3 sm:px-8">
                <span className="font-mono text-xl font-semibold tabular-nums text-text-primary sm:text-[28px]">
                  {stat.value}
                </span>
                <span className="text-[10px] text-text-secondary sm:text-[13px]">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Data Sources Section */}
      <section className="border-t border-border-subtle bg-surface px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
        <div className="mx-auto max-w-4xl">
          <div className="flex flex-col items-center gap-4 sm:gap-6 mb-12 sm:mb-16">
            <p className="font-mono text-[10px] font-medium tracking-[0.2em] text-text-secondary sm:text-xs">
              CONNECT ANYWHERE
            </p>
            <h2 className="font-heading text-3xl font-bold text-text-primary sm:text-4xl">
              Your data, your platform
            </h2>
            <p className="max-w-xl text-sm text-text-secondary text-center sm:text-base">
              Connect 5+ enterprise data sources. AI infers names, problem statements, and success metrics. Scheduled refreshes keep everything current.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5 mb-12">
            {[
              {
                label: 'PostgreSQL',
                desc: 'Relational',
                color: '#4169E1',
                path: 'M23.5594 14.7228a.5269.5269 0 0 0-.0563-.1191c-.139-.2632-.4768-.3418-1.0074-.2321-1.6533.3411-2.2935.1312-2.5256-.0191 1.342-2.0482 2.445-4.522 3.0411-6.8297.2714-1.0507.7982-3.5237.1222-4.7316a1.5641 1.5641 0 0 0-.1509-.235C21.6931.9086 19.8007.0248 17.5099.0005c-1.4947-.0158-2.7705.3461-3.1161.4794a9.449 9.449 0 0 0-.5159-.0816 8.044 8.044 0 0 0-1.3114-.1278c-1.1822-.0184-2.2038.2642-3.0498.8406-.8573-.3211-4.7888-1.645-7.2219.0788C.9359 2.1526.3086 3.8733.4302 6.3043c.0409.818.5069 3.334 1.2423 5.7436.4598 1.5065.9387 2.7019 1.4334 3.582.553.9942 1.1259 1.5933 1.7143 1.7895.4474.1491 1.1327.1441 1.8581-.7279.8012-.9635 1.5903-1.8258 1.9446-2.2069.4351.2355.9064.3625 1.39.3772a.0569.0569 0 0 0 .0004.0041 11.0312 11.0312 0 0 0-.2472.3054c-.3389.4302-.4094.5197-1.5002.7443-.3102.064-1.1344.2339-1.1464.8115-.0025.1224.0329.2309.0919.3268.2269.4231.9216.6097 1.015.6331 1.3345.3335 2.5044.092 3.3714-.6787-.017 2.231.0775 4.4174.3454 5.0874.2212.5529.7618 1.9045 2.4692 1.9043.2505 0 .5263-.0291.8296-.0941 1.7819-.3821 2.5557-1.1696 2.855-2.9059.1503-.8707.4016-2.8753.5388-4.1012.0169-.0703.0357-.1207.057-.1362.0007-.0005.0697-.0471.4272.0307a.3673.3673 0 0 0 .0443.0068l.2539.0223.0149.001c.8468.0384 1.9114-.1426 2.5312-.4308.6438-.2988 1.8057-1.0323 1.5951-1.6698zM2.371 11.8765c-.7435-2.4358-1.1779-4.8851-1.2123-5.5719-.1086-2.1714.4171-3.6829 1.5623-4.4927 1.8367-1.2986 4.8398-.5408 6.108-.13-.0032.0032-.0066.0061-.0098.0094-2.0238 2.044-1.9758 5.536-1.9708 5.7495-.0002.0823.0066.1989.0162.3593.0348.5873.0996 1.6804-.0735 2.9184-.1609 1.1504.1937 2.2764.9728 3.0892.0806.0841.1648.1631.2518.2374-.3468.3714-1.1004 1.1926-1.9025 2.1576-.5677.6825-.9597.5517-1.0886.5087-.3919-.1307-.813-.5871-1.2381-1.3223-.4796-.839-.9635-2.0317-1.4155-3.5126zm6.0072 5.0871c-.1711-.0428-.3271-.1132-.4322-.1772.0889-.0394.2374-.0902.4833-.1409 1.2833-.2641 1.4815-.4506 1.9143-1.0002.0992-.126.2116-.2687.3673-.4426a.3549.3549 0 0 0 .0737-.1298c.1708-.1513.2724-.1099.4369-.0417.156.0646.3078.26.3695.4752.0291.1016.0619.2945-.0452.4444-.9043 1.2658-2.2216 1.2494-3.1676 1.0128zm2.094-3.988-.0525.141c-.133.3566-.2567.6881-.3334 1.003-.6674-.0021-1.3168-.2872-1.8105-.8024-.6279-.6551-.9131-1.5664-.7825-2.5004.1828-1.3079.1153-2.4468.079-3.0586-.005-.0857-.0095-.1607-.0122-.2199.2957-.2621 1.6659-.9962 2.6429-.7724.4459.1022.7176.4057.8305.928.5846 2.7038.0774 3.8307-.3302 4.7363-.084.1866-.1633.3629-.2311.5454zm7.3637 4.5725c-.0169.1768-.0358.376-.0618.5959l-.146.4383a.3547.3547 0 0 0-.0182.1077c-.0059.4747-.054.6489-.115.8693-.0634.2292-.1353.4891-.1794 1.0575-.11 1.4143-.8782 2.2267-2.4172 2.5565-1.5155.3251-1.7843-.4968-2.0212-1.2217a6.5824 6.5824 0 0 0-.0769-.2266c-.2154-.5858-.1911-1.4119-.1574-2.5551.0165-.5612-.0249-1.9013-.3302-2.6462.0044-.2932.0106-.5909.019-.8918a.3529.3529 0 0 0-.0153-.1126 1.4927 1.4927 0 0 0-.0439-.208c-.1226-.4283-.4213-.7866-.7797-.9351-.1424-.059-.4038-.1672-.7178-.0869.067-.276.1831-.5875.309-.9249l.0529-.142c.0595-.16.134-.3257.213-.5012.4265-.9476 1.0106-2.2453.3766-5.1772-.2374-1.0981-1.0304-1.6343-2.2324-1.5098-.7207.0746-1.3799.3654-1.7088.5321a5.6716 5.6716 0 0 0-.1958.1041c.0918-1.1064.4386-3.1741 1.7357-4.4823a4.0306 4.0306 0 0 1 .3033-.276.3532.3532 0 0 0 .1447-.0644c.7524-.5706 1.6945-.8506 2.802-.8325.4091.0067.8017.0339 1.1742.081 1.939.3544 3.2439 1.4468 4.0359 2.3827.8143.9623 1.2552 1.9315 1.4312 2.4543-1.3232-.1346-2.2234.1268-2.6797.779-.9926 1.4189.543 4.1729 1.2811 5.4964.1353.2426.2522.4522.2889.5413.2403.5825.5515.9713.7787 1.2552.0696.087.1372.1714.1885.245-.4008.1155-1.1208.3825-1.0552 1.717-.0123.1563-.0423.4469-.0834.8148-.0461.2077-.0702.4603-.0994.7662zm.8905-1.6211c-.0405-.8316.2691-.9185.5967-1.0105a2.8566 2.8566 0 0 0 .135-.0406 1.202 1.202 0 0 0 .1342.103c.5703.3765 1.5823.4213 3.0068.1344-.2016.1769-.5189.3994-.9533.6011-.4098.1903-1.0957.333-1.7473.3636-.7197.0336-1.0859-.0807-1.1721-.151zm.5695-9.2712c-.0059.3508-.0542.6692-.1054 1.0017-.055.3576-.112.7274-.1264 1.1762-.0142.4368.0404.8909.0932 1.3301.1066.887.216 1.8003-.2075 2.7014a3.5272 3.5272 0 0 1-.1876-.3856c-.0527-.1276-.1669-.3326-.3251-.6162-.6156-1.1041-2.0574-3.6896-1.3193-4.7446.3795-.5427 1.3408-.5661 2.1781-.463zm.2284 7.0137a12.3762 12.3762 0 0 0-.0853-.1074l-.0355-.0444c.7262-1.1995.5842-2.3862.4578-3.4385-.0519-.4318-.1009-.8396-.0885-1.2226.0129-.4061.0666-.7543.1185-1.0911.0639-.415.1288-.8443.1109-1.3505.0134-.0531.0188-.1158.0118-.1902-.0457-.4855-.5999-1.938-1.7294-3.253-.6076-.7073-1.4896-1.4972-2.6889-2.0395.5251-.1066 1.2328-.2035 2.0244-.1859 2.0515.0456 3.6746.8135 4.8242 2.2824a.908.908 0 0 1 .0667.1002c.7231 1.3556-.2762 6.2751-2.9867 10.5405zm-8.8166-6.1162c-.025.1794-.3089.4225-.6211.4225a.5821.5821 0 0 1-.0809-.0056c-.1873-.026-.3765-.144-.5059-.3156-.0458-.0605-.1203-.178-.1055-.2844.0055-.0401.0261-.0985.0925-.1488.1182-.0894.3518-.1226.6096-.0867.3163.0441.6426.1938.6113.4186zm7.9305-.4114c.0111.0792-.049.201-.1531.3102-.0683.0717-.212.1961-.4079.2232a.5456.5456 0 0 1-.075.0052c-.2935 0-.5414-.2344-.5607-.3717-.024-.1765.2641-.3106.5611-.352.297-.0414.6111.0088.6356.1851z',
              },
              {
                label: 'Snowflake',
                desc: 'Warehouse',
                color: '#29B5E8',
                path: 'M7.602 12.4c.038-.151.076-.304.076-.456 0-.114-.038-.228-.038-.342-.114-.343-.304-.647-.646-.838l-4.87-2.777c-.685-.38-1.56-.152-1.94.533-.381.685-.153 1.56.532 1.94l2.701 1.56-2.701 1.56c-.685.38-.913 1.256-.533 1.94.38.685 1.256.914 1.94.533l4.832-2.777c.343-.267.571-.533.647-.876zm1.332 2.626c-.266-.038-.57.038-.837.19l-4.832 2.777c-.685.38-.913 1.256-.532 1.94.38.686 1.255.914 1.94.533l2.701-1.56v3.12c0 .8.647 1.408 1.446 1.408.799 0 1.407-.647 1.407-1.408v-5.592c0-.761-.57-1.37-1.293-1.408zm4.946-6.088c.266.038.57-.038.837-.19l4.832-2.777c.685-.38.913-1.256.532-1.94-.38-.686-1.255-.914-1.94-.533l-2.701 1.56V1.975c0-.799-.647-1.408-1.446-1.408-.799 0-1.446.609-1.446 1.408V7.53c0 .76.609 1.37 1.332 1.407zM3.265 5.97l4.832 2.777c.266.152.533.19.837.19.723-.038 1.331-.684 1.331-1.407V1.975c0-.799-.646-1.408-1.407-1.408-.799 0-1.446.647-1.446 1.408v3.12l-2.701-1.56c-.685-.38-1.56-.152-1.94.533-.419.646-.19 1.521.494 1.902zm9.093 6.011a.412.412 0 00-.114-.266l-.57-.571a.346.346 0 00-.267-.114.412.412 0 00-.266.114l-.571.57a.411.411 0 00-.114.267c0 .076.038.19.114.267l.57.57a.345.345 0 00.267.114c.076 0 .19-.038.266-.114l.571-.57a.412.412 0 00.114-.267zm1.598.533L11.94 14.53c-.039.038-.153.114-.229.114h-.608a.411.411 0 01-.267-.114L8.82 12.514a.408.408 0 01-.076-.229v-.608c0-.076.038-.19.114-.267l2.016-2.016a.41.41 0 01.267-.114h.608a.41.41 0 01.267.114l2.016 2.016a.347.347 0 01.114.267v.608c-.076.077-.114.19-.19.229zm5.593 5.44l-4.832-2.777c-.266-.152-.57-.19-.837-.152-.723.038-1.332.684-1.332 1.408v5.554c0 .8.647 1.408 1.408 1.408.799 0 1.446-.647 1.446-1.408v-3.12l2.7 1.56c.686.38 1.561.152 1.941-.533.419-.646.19-1.521-.494-1.94zm2.549-7.533l-2.701 1.56 2.7 1.56c.686.38.914 1.256.533 1.94-.38.685-1.255.913-1.94.533l-4.832-2.778a1.644 1.644 0 01-.647-.798c-.037-.153-.076-.305-.076-.457 0-.114.039-.228.039-.342.114-.343.342-.647.646-.837l4.832-2.778c.685-.38 1.56-.152 1.94.533.457.609.19 1.484-.494 1.864',
              },
              {
                label: 'BigQuery',
                desc: 'Google Cloud',
                color: '#669DF6',
                path: 'M5.676 10.595h2.052v5.244a5.892 5.892 0 0 1-2.052-2.088v-3.156zm18.179 10.836a.504.504 0 0 1 0 .708l-1.716 1.716a.504.504 0 0 1-.708 0l-4.248-4.248a.206.206 0 0 1-.007-.007c-.02-.02-.028-.045-.043-.066a10.736 10.736 0 0 1-6.334 2.065C4.835 21.599 0 16.764 0 10.799S4.835 0 10.8 0s10.799 4.835 10.799 10.8c0 2.369-.772 4.553-2.066 6.333.025.017.052.028.074.05l4.248 4.248zm-5.028-10.632a8.015 8.015 0 1 0-8.028 8.028h.024a8.016 8.016 0 0 0 8.004-8.028zm-4.86 4.98a6.002 6.002 0 0 0 2.04-2.184v-1.764h-2.04v3.948zm-4.5.948c.442.057.887.08 1.332.072.4.025.8.025 1.2 0V7.692H9.468v9.035z',
              },
              {
                label: 'S3',
                desc: 'AWS Storage',
                color: '#569A31',
                path: 'M20.913 13.147l.12-.895c.947.576 1.258.922 1.354 1.071-.16.031-.562.046-1.474-.176zm-2.174 7.988a.547.547 0 0 0-.005.073c0 .084-.207.405-1.124.768a10.28 10.28 0 0 1-1.438.432c-1.405.325-3.128.504-4.853.504-4.612 0-7.412-1.184-7.412-1.704a.547.547 0 0 0-.005-.073L1.81 5.602c.135.078.28.154.432.227.042.02.086.038.128.057.134.062.272.122.417.18l.179.069c.154.058.314.114.478.168.043.013.084.029.13.043.207.065.423.127.646.187l.176.044c.175.044.353.087.534.127a23.414 23.414 0 0 0 .843.17l.121.023c.252.045.508.085.768.122.071.011.144.02.216.03.2.027.4.053.604.077l.24.027c.245.026.49.05.74.07l.081.009c.275.022.552.04.83.056l.233.012c.21.01.422.018.633.025a33.088 33.088 0 0 0 2.795-.026l.232-.011c.278-.016.555-.034.83-.056l.08-.008c.25-.02.497-.045.742-.072l.238-.026c.205-.024.408-.05.609-.077.07-.01.141-.019.211-.03.261-.037.519-.078.772-.122l.111-.02c.215-.04.427-.082.634-.125l.212-.047c.186-.041.368-.085.546-.13l.166-.042c.225-.06.444-.122.654-.189.04-.012.077-.026.115-.038a10.6 10.6 0 0 0 .493-.173c.058-.021.114-.044.17-.066.15-.06.293-.12.43-.185.038-.017.079-.034.116-.052.153-.073.3-.15.436-.228l-.976 7.245c-2.488-.78-5.805-2.292-7.311-3a1.09 1.09 0 0 0-1.088-1.085c-.6 0-1.088.489-1.088 1.088 0 .6.488 1.089 1.088 1.089.196 0 .378-.056.537-.148 1.72.812 5.144 2.367 7.715 3.15zm-7.42-20.047c5.677 0 9.676 1.759 9.75 2.736l-.014.113c-.01.033-.031.067-.048.101-.015.028-.026.057-.047.087-.024.033-.058.068-.09.102-.028.03-.051.06-.084.09-.038.035-.087.07-.133.105-.04.03-.074.06-.119.091-.053.036-.116.071-.177.107-.05.03-.095.06-.15.09-.068.036-.147.073-.222.11-.059.028-.114.057-.177.085-.084.038-.177.074-.268.111-.068.027-.13.054-.203.082-.097.036-.205.072-.31.107-.075.026-.148.053-.228.079-.111.035-.233.069-.35.103-.085.024-.165.05-.253.073-.124.034-.258.065-.389.098-.093.022-.181.046-.278.068-.139.032-.287.061-.433.091-.098.02-.191.041-.293.06-.155.03-.32.057-.482.084-.1.018-.198.036-.302.052-.166.026-.342.048-.515.072-.11.014-.213.03-.325.044-.181.023-.372.041-.56.06-.11.012-.218.025-.332.036-.188.016-.386.029-.58.043-.122.009-.24.02-.364.028-.207.012-.422.02-.635.028-.12.005-.234.012-.354.016a35.605 35.605 0 0 1-2.069 0c-.12-.004-.234-.011-.352-.016-.214-.008-.43-.016-.637-.028-.122-.008-.238-.02-.36-.027-.195-.015-.394-.028-.584-.044-.11-.01-.215-.024-.324-.035-.19-.02-.384-.038-.568-.06l-.315-.044c-.176-.024-.355-.046-.525-.073-.1-.015-.192-.033-.29-.05-.167-.028-.335-.055-.494-.086-.096-.018-.183-.038-.276-.056-.151-.032-.305-.062-.45-.095-.09-.02-.173-.043-.26-.064-.138-.034-.277-.067-.407-.102-.082-.022-.157-.046-.235-.069a11.75 11.75 0 0 1-.368-.108c-.075-.024-.141-.049-.213-.073-.11-.037-.223-.075-.325-.113-.067-.025-.125-.051-.188-.077-.096-.038-.195-.076-.282-.115-.06-.027-.11-.054-.166-.08-.08-.039-.162-.077-.233-.116-.052-.028-.094-.055-.142-.084-.063-.038-.13-.075-.185-.113-.043-.029-.075-.058-.113-.086-.048-.037-.098-.073-.139-.11-.032-.029-.054-.057-.08-.087-.033-.035-.069-.07-.093-.104-.02-.03-.031-.058-.046-.086-.018-.035-.039-.068-.049-.102l-.015-.113c.076-.977 4.074-2.736 9.748-2.736zm12.182 12.124c-.118-.628-.84-1.291-2.31-2.128l.963-7.16a.531.531 0 0 0 .005-.073C22.16 1.581 16.447 0 11.32 0 6.194 0 .482 1.581.482 3.851a.58.58 0 0 0 .005.072L2.819 21.25c.071 2.002 5.236 2.75 8.5 2.75 1.805 0 3.615-.188 5.098-.531.598-.138 1.133-.3 1.592-.48 1.18-.467 1.789-1.053 1.813-1.739l.945-7.018c.557.131 1.016.197 1.389.197.54 0 .902-.137 1.134-.413a.956.956 0 0 0 .21-.804Z',
              },
              {
                label: 'GCS',
                desc: 'Cloud Storage',
                color: '#4285F4',
                path: 'M24 2.4v8.4h-2.4V2.4H24zM0 10.8h2.4V2.4H0v8.4zm3-8.4h18v8.4H3V2.4zm12.6 4.2a1.8 1.8 0 1 0 3.6 0 1.8 1.8 0 0 0-3.6 0zm-10.8.6H12V6H4.8v1.2zm16.8 14.4H24v-8.4h-2.4v8.4zM0 21.6h2.4v-8.4H0v8.4zm3-8.4h18v8.4H3v-8.4zm12.6 4.2a1.8 1.8 0 1 0 3.6 0 1.8 1.8 0 0 0-3.6 0zM4.8 18H12v-1.2H4.8V18z',
              },
            ].map(({ label, desc, color, path }) => (
              <div key={label} className="flex flex-col items-center gap-2 p-4 rounded-lg bg-bg-base border border-border-subtle hover:border-border-default transition-colors">
                <svg viewBox="0 0 24 24" className="w-8 h-8" fill={color}><path d={path} /></svg>
                <span className="font-medium text-xs sm:text-sm text-center text-text-primary">{label}</span>
                <span className="text-[10px] text-text-secondary text-center">{desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
        <div className="mx-auto max-w-4xl">
          <div className="grid md:grid-cols-2 gap-8 sm:gap-12">
            {[
              {
                icon: '⟡',
                title: 'Connect Anywhere',
                description: 'Ingest from CSV, PostgreSQL, Snowflake, BigQuery, S3, or GCS. One unified interface for all enterprise data sources.',
              },
              {
                icon: '◆',
                title: 'AI Autofill',
                description: 'Claude analyzes your data and auto-generates dataset names, problem statements, and success metrics in seconds.',
              },
              {
                icon: '⟡',
                title: 'Keep Data Fresh',
                description: 'Set daily refresh schedules. Automatic syncs with full history, error tracking, and manual refresh on demand.',
              },
              {
                icon: '◆',
                title: 'Measure Business Impact',
                description: 'Track the outcome hypothesis for each dataset. Document what problem it solves and measure the business results.',
              },
            ].map(({ icon, title, description }) => (
              <div key={title} className="flex flex-col gap-3 p-5 rounded-lg border border-border-subtle bg-bg-base hover:border-border-default transition-colors">
                <div className="text-xl font-semibold text-accent">{icon}</div>
                <h3 className="font-heading text-lg font-semibold text-text-primary">{title}</h3>
                <p className="text-sm text-text-secondary leading-6">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border-subtle bg-surface px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-3xl font-bold text-text-primary sm:text-4xl mb-4">
            Ready to ship data products?
          </h2>
          <p className="text-text-secondary mb-8">
            Start with CSV. Scale to enterprise data warehouses. Crystal grows with your data maturity.
          </p>
          <Link href="/dashboard" className="inline-flex items-center justify-center gap-3 rounded-lg bg-accent px-8 py-4 text-base font-semibold text-white transition-colors hover:bg-accent-light">
            Open Dashboard <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
    </main>
  )
}
