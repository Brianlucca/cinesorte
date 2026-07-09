import { useParams } from "react-router-dom";
import PersonBio from "@features/people/components/PersonBio";
import PersonFilmography from "@features/people/components/PersonFilmography";
import PersonHeader from "@features/people/components/PersonHeader";
import PersonImages from "@features/people/components/PersonImages";
import PersonInfo from "@features/people/components/PersonInfo";
import PersonReviewsSection from "@features/people/components/PersonReviewsSection";
import { usePersonDetails } from "@features/people/hooks/usePersonDetails";

export default function PersonDetails() {
  const { id } = useParams();
  const { details, reviews, loading, actions } = usePersonDetails(id);

  if (loading) {
    return (
      <div className="grid h-screen place-items-center bg-zinc-950">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-violet-600 border-t-transparent" />
      </div>
    );
  }

  if (!details) {
    return (
      <div className="grid h-screen place-items-center bg-zinc-950 text-white">
        Pessoa não encontrada.
      </div>
    );
  }

  return (
    <div className="relative isolate -mt-24 min-h-screen overflow-x-hidden bg-zinc-950 pb-24 text-white md:-mt-8">
      <PersonHeader
        details={details}
      />

      <div className="relative z-20 mx-auto -mt-8 grid max-w-[1600px] grid-cols-1 gap-12 px-5 sm:px-8 md:-mt-12 md:px-12 lg:grid-cols-12 xl:px-16">
        <main className="space-y-14 lg:col-span-8 md:space-y-16">
          <PersonBio biography={details.biography} />
          <PersonFilmography credits={details.combined_credits} />
          {details.images?.profiles?.length > 0 && (
            <PersonImages images={details.images} name={details.name} />
          )}

          <section className="relative overflow-visible rounded-[2rem] border border-white/[0.07] bg-[radial-gradient(ellipse_at_top_left,rgba(124,58,237,0.08),transparent_38%)] p-5 sm:p-7 md:p-9">
            <div className="mb-7">
              <span className="text-[10px] font-black uppercase tracking-[0.24em] text-violet-400">
                Conversa da comunidade
              </span>
              <h2 className="mt-2 text-2xl font-black text-white md:text-3xl">
                Comentários sobre {details.name}
              </h2>
            </div>
            <PersonReviewsSection
              reviews={reviews}
              onPostReview={actions.handlePostReview}
              onEditReview={actions.handleEditReview}
              onReply={actions.handlePostReply}
              onEditReply={actions.handleEditReply}
              onDelete={actions.handleDeleteReview}
              onDeleteComment={actions.handleDeleteComment}
            />
          </section>
        </main>

        <aside className="lg:col-span-4">
          <div className="lg:sticky lg:top-24">
            <PersonInfo details={details} />
          </div>
        </aside>
      </div>
    </div>
  );
}
