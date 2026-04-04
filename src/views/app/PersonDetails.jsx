import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { LayoutList, MessageSquare } from 'lucide-react';

import { usePersonDetails } from '../../hooks/usePersonDetails';
import PersonHeader from '../../components/PersonDetails/PersonHeader';
import PersonBio from '../../components/PersonDetails/PersonBio';
import PersonFilmography from '../../components/PersonDetails/PersonFilmography';
import PersonInfo from '../../components/PersonDetails/PersonInfo';
import PersonReviewsSection from '../../components/PersonDetails/PersonReviewsSection';
import PersonImages from '../../components/PersonDetails/PersonImages';

const PersonDetails = () => {
  const { id } = useParams();
  const { details, reviews, loading, actions } = usePersonDetails(id);
  const [activeTab, setActiveTab] = useState('overview');

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-zinc-950">
        <div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!details) return null;

  return (
    <div className="-mt-24 md:-mt-8 pb-20 w-full animate-in fade-in duration-700 bg-zinc-950 min-h-screen">
      
      <PersonHeader details={details} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 max-w-[1600px] mx-auto px-6 md:px-12 relative z-20 -mt-10 md:mt-8 items-start">
        
        <div className="hidden lg:block lg:col-span-5 xl:col-span-4">
          <div className="bg-white/[0.02] backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-2xl">
            <PersonInfo details={details} />
          </div>
        </div>

        <div className="lg:col-span-7 xl:col-span-8 flex flex-col min-h-[500px]">
            
            <div className="lg:hidden mb-8 bg-white/[0.02] backdrop-blur-xl border border-white/5 rounded-3xl p-6 md:p-8 shadow-2xl">
                <PersonInfo details={details} />
            </div>

            <div className="top-20 lg:top-24 z-30 pt-4 pb-6 bg-zinc-950/80 backdrop-blur-xl -mx-6 px-6 md:mx-0 md:px-0 mb-4 border-b border-white/5 md:border-none">
                <div className="flex items-center p-1.5 bg-white/[0.02] border border-white/10 rounded-2xl w-max shadow-lg">
                    <button 
                        onClick={() => setActiveTab('overview')}
                        className={`flex items-center gap-2.5 px-6 py-3 rounded-xl text-xs md:text-sm font-bold uppercase tracking-wider transition-all duration-300 ${activeTab === 'overview' ? 'bg-violet-600 text-white shadow-[0_0_20px_rgba(139,92,246,0.3)]' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
                    >
                        <LayoutList size={18} /> Visão Geral
                    </button>
                    <button 
                        onClick={() => setActiveTab('reviews')}
                        className={`flex items-center gap-2.5 px-6 py-3 rounded-xl text-xs md:text-sm font-bold uppercase tracking-wider transition-all duration-300 ${activeTab === 'reviews' ? 'bg-violet-600 text-white shadow-[0_0_20px_rgba(139,92,246,0.3)]' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
                    >
                        <MessageSquare size={18} /> Comentários
                        <span className={`px-2 py-0.5 rounded-md text-[10px] md:text-xs font-black transition-colors ${activeTab === 'reviews' ? 'bg-white/20 text-white' : 'bg-zinc-800 text-zinc-400'}`}>
                            {reviews.length}
                        </span>
                    </button>
                </div>
            </div>

            <div className="flex-1 w-full relative">
                {activeTab === 'overview' && (
                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-500 space-y-8 pb-10">
                        <div className="bg-white/[0.02] backdrop-blur-xl border border-white/5 rounded-3xl p-8 md:p-10 shadow-lg">
                            <PersonBio biography={details.biography} />
                        </div>
                        
                        {details.images && (
                            <div className="bg-white/[0.02] backdrop-blur-xl border border-white/5 rounded-3xl p-8 md:p-10 shadow-lg">
                                <PersonImages images={details.images} name={details.name} />
                            </div>
                        )}

                        <div className="bg-white/[0.02] backdrop-blur-xl border border-white/5 rounded-3xl p-8 md:p-10 shadow-lg">
                            <PersonFilmography credits={details.combined_credits} />
                        </div>
                    </div>
                )}

                {activeTab === 'reviews' && (
                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-500 bg-white/[0.02] backdrop-blur-xl border border-white/5 rounded-3xl p-8 md:p-10 shadow-lg">
                        <PersonReviewsSection 
                            reviews={reviews}
                            onPostReview={actions.handlePostReview}
                            onEditReview={actions.handleEditReview}
                            onReply={actions.handlePostReply}
                            onEditReply={actions.handleEditReply}
                            onDelete={actions.handleDeleteReview}
                            onDeleteComment={actions.handleDeleteComment}
                        />
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default PersonDetails;