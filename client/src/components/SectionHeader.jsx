import React from 'react';

export default function SectionHeader({ badge, title, description }) {
    return (
        <div className="section-header">
            {badge && <span className="badge">{badge}</span>}
            {title && <h2>{title}</h2>}
            {description && <p>{description}</p>}
        </div>
    );
}
