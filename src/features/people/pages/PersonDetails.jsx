import { useParams } from "react-router-dom";
import PersonBio from "@features/people/components/PersonBio";
import PersonFilmography from "@features/people/components/PersonFilmography";
import PersonHeader from "@features/people/components/PersonHeader";
import PersonImages from "@features/people/components/PersonImages";
import PersonInfo from "@features/people/components/PersonInfo";
import ReviewsSection from "@features/media/components/reviews/ReviewsSection";
import { usePersonDetails } from "@features/people/hooks/usePersonDetails";

export default function PersonDetails() {
  const { id } = useParams();
  const { details, reviews, loading, actions } = usePersonDetails(id);

  if (loading) {
    return (
      <div className="grid h-screen place-items-center bg-[#111216]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-violet-600 border-t-transparent" />
      </div>
    );
  }

  if (!details) {
    return (
      <div className="grid h-screen place-items-center bg-[#111216] text-white">
        Pessoa não encontrada.
      </div>
    );
  }

  return (
    <div className="relative isolate -mt-24 min-h-screen overflow-x-hidden bg-[#111216] pb-24 text-white md:-mt-8">
      <PersonHeader details={details} />

      <nav
        aria-label="Navegação do perfil"
        className="scrollbar-hide relative z-20 mx-auto flex max-w-[1380px] gap-5 overflow-x-auto border-b border-white/[0.06] px-4 py-3 sm:px-8 md:px-10 xl:px-12"
      >
        {[
          { href: "#person-filmography", label: "Filmografia", available: details.combined_credits?.cast?.length > 0 },
          { href: "#person-gallery", label: "Fotos", available: details.images?.profiles?.length > 0 },
          { href: "#person-reviews", label: "Comentários", available: true },
        ]
          .filter((item) => item.available)
          .map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="shrink-0 whitespace-nowrap py-1 text-xs font-medium text-zinc-400 transition-colors hover:text-white"
            >
              {item.label}
            </a>
          ))}
      </nav>

      <div className="relative z-20 mx-auto grid max-w-[1380px] min-w-0 grid-cols-1 gap-8 px-4 sm:px-8 md:px-10 lg:grid-cols-12 lg:gap-10 xl:gap-14 xl:px-12">
        <aside className="order-1 min-w-0 pt-4 sm:pt-5 lg:order-2 lg:col-span-4 lg:pt-8">
          <div className="lg:sticky lg:top-24">
            <PersonInfo details={details} />
          </div>
        </aside>

        <main className="order-2 min-w-0 space-y-10 lg:order-1 lg:col-span-8 lg:space-y-14">
          {details.biography && <PersonBio biography={details.biography} />}
          <PersonFilmography credits={details.combined_credits} />
          {details.images?.profiles?.length > 0 && (
            <PersonImages images={details.images} name={details.name} />
          )}

          <section id="person-reviews" className="scroll-mt-24 border-t border-white/[0.07] pt-8">
            <div className="mb-7">
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-violet-300">
                Conversa da comunidade
              </span>
              <h2 className="mt-1.5 text-xl font-semibold tracking-[-0.02em] text-white md:text-2xl">
                Comentários sobre {details.name}
              </h2>
            </div>
            <ReviewsSection
              reviews={reviews}
              onPostReview={actions.handlePostReview}
              onEditReview={actions.handleEditReview}
              onReply={actions.handlePostReply}
              onEditReply={actions.handleEditReply}
              onDelete={actions.handleDeleteReview}
              onDeleteComment={actions.handleDeleteComment}
              onLike={actions.handleLikeReview}
              onLoadReplies={actions.handleLoadReplies}
            />
          </section>
        </main>
      </div>
    </div>
  );
}
