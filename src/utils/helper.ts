// Function to truncate description
// Strips HTML first (descriptions now come from a rich-text editor), so table
// previews read as plain text instead of showing raw <p> / <strong> markup.
export const truncateDescription = (description: string, maxLength: number = 50) => {
    const plain = description.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    if (plain.length <= maxLength) return plain;
    return plain.substring(0, maxLength) + '...';
};