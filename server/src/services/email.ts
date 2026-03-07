import { Resend } from 'resend'
import type { Role } from '../types'

let resend: Resend | null = null

function getResend(): Resend {
  if (!resend) resend = new Resend(process.env.RESEND_API_KEY)
  return resend
}

export async function sendInviteEmail(
  to: string,
  workspaceName: string,
  role: Role,
  invitedByEmail: string,
  workspaceId: string,
  inviteId: string,
): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[email] RESEND_API_KEY not set — skipping invite email to', to)
    return
  }

  const appUrl = process.env.APP_URL ?? 'http://localhost:5173'
  const acceptUrl = `${appUrl}/accept-invite?workspaceId=${workspaceId}&inviteId=${inviteId}`

  await getResend().emails.send({
    from: process.env.EMAIL_FROM ?? 'trankilo-ai <noreply@trankilo-ai.com>',
    to,
    subject: `You've been invited to ${workspaceName} on trankilo-ai`,
    html: `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;border:1px solid #e4e4e7;overflow:hidden;">
        <tr>
          <td style="padding:32px 40px 24px;border-bottom:1px solid #f4f4f5;text-align:center;">
            <span style="font-size:32px;">🦥</span>
            <p style="margin:8px 0 0;font-size:18px;font-weight:600;color:#09090b;">trankilo-ai</p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 40px;">
            <p style="margin:0 0 16px;font-size:15px;color:#3f3f46;">
              <strong style="color:#09090b;">${invitedByEmail}</strong> has invited you to join
              <strong style="color:#09090b;">${workspaceName}</strong> as a
              <strong style="color:#09090b;">${role}</strong>.
            </p>
            <p style="margin:0 0 28px;font-size:14px;color:#71717a;">
              Click the button below to accept the invitation and get started.
            </p>
            <a href="${acceptUrl}" style="display:inline-block;background:#09090b;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:500;">
              Accept invitation
            </a>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 40px;border-top:1px solid #f4f4f5;text-align:center;">
            <p style="margin:0;font-size:12px;color:#a1a1aa;">
              If you weren't expecting this invitation, you can ignore this email.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  })
}
