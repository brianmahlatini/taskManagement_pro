// Simple email service that logs to console for development
// In production, this would integrate with a real email provider

export const sendInvitationEmail = async (
    to: string,
    teamName: string,
    inviterName: string,
    invitationLink: string
): Promise<void> => {
    console.log(`[EMAIL SERVICE] Sending invitation to: ${to}`);
    console.log(`Team: ${teamName}`);
    console.log(`Invited by: ${inviterName}`);
    console.log(`Invitation link: ${invitationLink}`);

    // In production, this would send a real email
    // For now, we'll just log the details
    console.log(`
        =========================================
        INVITATION EMAIL (DEVELOPMENT MODE)
        =========================================
        To: ${to}
        Subject: You're invited to join ${teamName} on TaskFlow

        Body:
        Hello,

        ${inviterName} has invited you to join the ${teamName} team on TaskFlow.

        Click this link to accept the invitation:
        ${invitationLink}

        This invitation will expire in 7 days.

        TaskFlow Team Collaboration Platform
        =========================================
    `);
};

export const sendPasswordResetEmail = async (
    to: string,
    resetLink: string
): Promise<void> => {
    console.log(`[EMAIL SERVICE] Sending password reset to: ${to}`);
    console.log(`Reset link: ${resetLink}`);

    // In production, this would send a real email
    // For now, we'll just log the details
    console.log(`
        =========================================
        PASSWORD RESET EMAIL (DEVELOPMENT MODE)
        =========================================
        To: ${to}
        Subject: Password Reset Request

        Body:
        Hello,

        Click this link to reset your password:
        ${resetLink}

        This link will expire in 1 hour.
        =========================================
    `);
};