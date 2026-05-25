import React from 'react';

const MovieCard = ({ movie }) => {
    return (
        <div style={{
            border: '1px solid #e0e0e0',
            borderRadius: '16px',
            padding: '30px',
            textAlign: 'center',
            backgroundColor: '#ffffff',
            boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
            transition: 'transform 0.2s',
            maxWidth: '600px',
            margin: '20px auto' // Kartların alt alta düzgün dizilmesi için margin ayarladık
        }}>
            {/* Film İsmi */}
            <h2 style={{ color: '#2c3e50', fontSize: '28px', margin: '0 0 10px 0' }}>
                {movie.title}
            </h2>

            {/* Film Türleri */}
            <p style={{ fontWeight: 'bold', color: '#8e44ad', fontSize: '14px', marginBottom: '15px' }}>
                {movie.genres}
            </p>

            {/* API'den gelen film özeti (overview) */}
            <p style={{ fontStyle: 'italic', color: '#34495e', fontSize: '15px', lineHeight: '1.6', textAlign: 'justify' }}>
                {movie.overview}
            </p>

            {/* TMDB ID'si */}
            <span style={{
                display: 'inline-block',
                marginTop: '15px',
                padding: '5px 10px',
                backgroundColor: '#f1f2f6',
                color: '#a4b0be',
                borderRadius: '8px',
                fontSize: '12px'
            }}>
                TMDB ID: {movie.id}
            </span>
        </div>
    );
};

export default MovieCard;