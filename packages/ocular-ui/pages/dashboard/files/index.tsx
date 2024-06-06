import SectionContainer from "@/components/section-container"
import { EmptyCard } from "@/components/files/empty-card"

export default function Files() {
  return (
    <SectionContainer>
      <EmptyCard
        title="No files uploaded"
        description="Upload some files to see them here"
        className="w-full"
      />
    </SectionContainer>
  )
}
