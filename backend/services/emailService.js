import config from '../config/config.js';

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  async initializeTransporter() {
    try {
      // Try to import nodemailer dynamically
      const nodemailerModule = await import('nodemailer');
      const nodemailer = nodemailerModule.default;
      
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: config.EMAIL_USER,
          pass: config.EMAIL_PASSWORD
        }
      });
      
      console.log('✅ Email service initialized successfully');
    } catch (error) {
      console.warn('⚠️ Email service disabled - nodemailer not available or invalid credentials');
      console.warn('   Error:', error.message);
      this.transporter = null;
    }
  }

  // Send meeting invite email
  async sendMeetingInvite(meetingData, recipientEmails) {
    // Wait for transporter to be initialized
    if (!this.transporter) {
      await this.initializeTransporter();
    }
    
    if (!this.transporter) {
      throw new Error('Email service not available. Please check your email credentials in .env file');
    }

    try {
      const { meetingId, meetingTopic, joinUrl, password, startTime } = meetingData;
      
      const emailContent = this.generateMeetingInviteEmail({
        meetingId,
        meetingTopic,
        joinUrl,
        password,
        startTime
      });

      const mailOptions = {
        from: config.EMAIL_USER,
        to: recipientEmails.join(', '),
        subject: `Meeting Invitation: ${meetingTopic}`,
        html: emailContent
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Meeting invite email sent successfully:', result.messageId);
      
      return {
        success: true,
        messageId: result.messageId,
        recipients: recipientEmails
      };
    } catch (error) {
      console.error('❌ Failed to send meeting invite email:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  // Generate HTML email content for meeting invite
  generateMeetingInviteEmail(meetingData) {
    const { meetingId, meetingTopic, joinUrl, password, startTime } = meetingData;
    
    const formattedTime = new Date(startTime).toLocaleString();
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Meeting Invitation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .meeting-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
          .join-button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
          .meeting-id { background: #f0f0f0; padding: 10px; border-radius: 5px; font-family: monospace; margin: 10px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📅 Meeting Invitation</h1>
            <p>You're invited to join a Zoom meeting</p>
          </div>
          
          <div class="content">
            <h2>${meetingTopic}</h2>
            
            <div class="meeting-details">
              <h3>Meeting Details:</h3>
              <p><strong>Date & Time:</strong> ${formattedTime}</p>
              <p><strong>Meeting ID:</strong></p>
              <div class="meeting-id">${meetingId}</div>
              <p><strong>Password:</strong></p>
              <div class="meeting-id">${password}</div>
            </div>
            
            <p>Click the button below to join the meeting:</p>
            <a href="${joinUrl}" class="join-button">🎥 Join Meeting</a>
            
            <div style="margin-top: 30px; padding: 20px; background: #e8f4fd; border-radius: 8px;">
              <h4>📋 Instructions:</h4>
              <ul>
                <li>Click "Join Meeting" to open Zoom</li>
                <li>Enter the Meeting ID: <strong>${meetingId}</strong></li>
                <li>Enter the Password: <strong>${password}</strong></li>
                <li>Allow camera and microphone when prompted</li>
                <li>Enjoy your AI-assisted meeting!</li>
              </ul>
            </div>
            
            <div class="footer">
              <p>This meeting is powered by AI Sales Assistant</p>
              <p>If you have any questions, please contact the meeting organizer</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Send call summary via email
  async sendCallSummary(callData, recipientEmail) {
    // Wait for transporter to be initialized
    if (!this.transporter) {
      await this.initializeTransporter();
    }
    
    if (!this.transporter) {
      throw new Error('Email service not available. Please check your email credentials in .env file');
    }

    try {
      const { callTitle, summary, callDate, callDuration, transcripts } = callData;
      
      const emailContent = this.generateCallSummaryEmail({
        callTitle,
        summary,
        callDate,
        callDuration,
        transcripts
      });

      const mailOptions = {
        from: config.EMAIL_USER,
        to: recipientEmail,
        subject: `Call Summary: ${callTitle || 'Untitled Call'}`,
        html: emailContent
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Call summary email sent successfully:', result.messageId);
      
      return {
        success: true,
        messageId: result.messageId,
        recipient: recipientEmail
      };
    } catch (error) {
      console.error('❌ Failed to send call summary email:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  // Generate HTML email content for call summary
  generateCallSummaryEmail(callData) {
    const { callTitle, summary, callDate, callDuration, transcripts } = callData;
    
    const formattedDate = callDate ? new Date(callDate).toLocaleString() : 'N/A';
    const formattedDuration = callDuration ? `${Math.floor(callDuration / 60)}m ${callDuration % 60}s` : 'N/A';
    
    // Generate transcript preview (first 500 characters)
    let transcriptPreview = '';
    if (transcripts && transcripts.length > 0) {
      const transcriptText = transcripts
        .slice(0, 10) // Show first 10 transcript items
        .map(t => `<strong>${t.speaker}:</strong> ${t.text}`)
        .join('<br><br>');
      transcriptPreview = transcriptText.length > 500 
        ? transcriptText.substring(0, 500) + '...' 
        : transcriptText;
    }
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Call Summary</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .summary-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
          .details-box { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
          .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
          .detail-row:last-child { border-bottom: none; }
          .detail-label { font-weight: bold; color: #666; }
          .transcript-preview { background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 15px 0; font-size: 14px; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📞 Call Summary</h1>
            <p>Shared from AI Sales Assistant</p>
          </div>
          
          <div class="content">
            <h2>${callTitle || 'Untitled Call'}</h2>
            
            <div class="details-box">
              <div class="detail-row">
                <span class="detail-label">Date & Time:</span>
                <span>${formattedDate}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Duration:</span>
                <span>${formattedDuration}</span>
              </div>
            </div>
            
            ${summary ? `
            <div class="summary-box">
              <h3>📋 Summary</h3>
              <p>${summary.replace(/\n/g, '<br>')}</p>
            </div>
            ` : ''}
            
            ${transcriptPreview ? `
            <div class="transcript-preview">
              <h3>💬 Conversation Preview</h3>
              <div>${transcriptPreview}</div>
              ${transcripts && transcripts.length > 10 ? `<p style="margin-top: 10px; color: #666; font-size: 12px;">... and ${transcripts.length - 10} more messages</p>` : ''}
            </div>
            ` : ''}
            
            <div class="footer">
              <p>This summary was generated by AI Sales Assistant</p>
              <p>If you have any questions, please contact the call organizer</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Test email service
  async testEmail() {
    try {
      const testEmail = {
        to: config.EMAIL_USER,
        subject: 'Test Email from AI Sales Assistant',
        html: '<h1>Test Email</h1><p>This is a test email from the AI Sales Assistant.</p>'
      };

      const result = await this.transporter.sendMail(testEmail);
      console.log('✅ Test email sent successfully:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('❌ Test email failed:', error);
      throw error;
    }
  }
}

export default new EmailService(); 