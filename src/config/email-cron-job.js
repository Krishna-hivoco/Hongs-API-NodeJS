// // src/config/emailcron.js
// import mongoose from "mongoose";
// import dotenv from "dotenv";
// import cron from "node-cron";
// import nodemailer from "nodemailer";

// dotenv.config();

// class EmailCronService {
//   constructor() {
//     this.cronJob = null;
//     this.transporter = null;
//     this.isRunning = false;
//     this.initializeEmailTransporter();
//   }

//   // Initialize email transporter
//   initializeEmailTransporter() {
//     this.transporter = nodemailer.createTransport({
//       host: process.env.EMAIL_HOST || "smtp.gmail.com",
//       port: process.env.EMAIL_PORT || 587,
//       secure: false,
//       auth: {
//         user: process.env.SMTP_USER,
//         pass: process.env.SMTP_PASSWORD,
//       },
//     });
//   }

//   // Function to fetch data from MongoDB
//   async fetchStoreData() {
//     try {
//       // Use existing mongoose connection if available, otherwise create new one
//       if (mongoose.connection.readyState !== 1) {
//         await mongoose.connect(process.env.MONGOOSE_URI);
//       }

//       const storeData = await mongoose.connection.db
//         .collection("in_person_count")
//         .findOne({ store_id: "kalkaji" });

//       console.log(`📦 [${new Date().toISOString()}] Email Cron - Data fetched`);
//       return storeData;
//     } catch (err) {
//       console.error(
//         `❌ [${new Date().toISOString()}] Email Cron - MongoDB Error:`,
//         err.message
//       );
//       throw err;
//     }
//   }

//   // Function to format data for email
//   formatDataForEmail(data) {
//     if (!data) {
//       return {
//         subject: "🚨 Kalkaji Store Data - No Data Available",
//         html: `
//           <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//             <h2 style="color: #e74c3c;">⚠️ Alert: No Data Available</h2>
//             <p>No data was found for Kalkaji store at ${new Date().toLocaleString()}.</p>
//             <p>Please check the system status.</p>
//           </div>
//         `,
//         text: `Alert: No data available for Kalkaji store at ${new Date().toLocaleString()}.`,
//       };
//     }

//     // Calculate occupancy percentage
//     const totalTables = Object.keys(data.tables || {}).length;
//     const occupiedTables = Object.values(data.tables || {}).filter(
//       (status) => status === "Occupied"
//     ).length;
//     const occupancyRate =
//       totalTables > 0 ? ((occupiedTables / totalTables) * 100).toFixed(1) : 0;

//     const getStatusColor = (inside) => {
//       if (inside === 0) return "#95a5a6";
//       if (inside <= 10) return "#27ae60";
//       if (inside <= 20) return "#f39c12";
//       return "#e74c3c";
//     };

//     const statusColor = getStatusColor(data.inside);
//     const timestamp = new Date(data.last_updated).toLocaleString("en-IN", {
//       timeZone: "Asia/Kolkata",
//       day: "2-digit",
//       month: "2-digit",
//       year: "numeric",
//       hour: "2-digit",
//       minute: "2-digit",
//     });

//     const tableStatusHtml = Object.entries(data.tables || {})
//       .map(([table, status]) => {
//         const statusIcon = status === "Occupied" ? "🔴" : "🟢";
//         const statusColor = status === "Occupied" ? "#e74c3c" : "#27ae60";
//         return `
//           <tr>
//             <td style="padding: 8px; border: 1px solid #ddd;">${table}</td>
//             <td style="padding: 8px; border: 1px solid #ddd; color: ${statusColor};">
//               ${statusIcon} ${status}
//             </td>
//           </tr>
//         `;
//       })
//       .join("");

//     const subject = `📊 Kalkaji Store Report - ${data.inside} People Inside | ${occupancyRate}% Table Occupancy`;

//     const html = `
//       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f9fa; padding: 20px;">
//         <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">

//           <div style="text-align: center; margin-bottom: 30px;">
//             <h1 style="color: #2c3e50; margin: 0;">🏪 Kalkaji Store Occupancy Report</h1>
//             <p style="color: #7f8c8d; margin: 10px 0;">Real-time occupancy data</p>
//             <p style="color: #95a5a6; font-size: 14px;">Last Updated: ${timestamp}</p>
//           </div>

//           <div style="display: flex; justify-content: space-around; margin-bottom: 30px;">
//             <div style="text-align: center; padding: 20px; background-color: ${statusColor}; color: white; border-radius: 8px; min-width: 100px;">
//               <h2 style="margin: 0; font-size: 36px;">${data.inside}</h2>
//               <p style="margin: 5px 0;">People Inside</p>
//             </div>
//             <div style="text-align: center; padding: 20px; background-color: #3498db; color: white; border-radius: 8px; min-width: 100px;">
//               <h2 style="margin: 0; font-size: 36px;">${occupancyRate}%</h2>
//               <p style="margin: 5px 0;">Table Occupancy</p>
//             </div>
//           </div>

//           <div style="margin-bottom: 30px;">
//             <h3 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px;">📈 Detailed Statistics</h3>
//             <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 20px;">
//               <div style="background-color: #ecf0f1; padding: 15px; border-radius: 5px;">
//                 <strong>👥 Gender Breakdown:</strong><br>
//                 👨 Male: ${data.male_count}<br>
//                 👩 Female: ${data.female_count}
//               </div>
//               <div style="background-color: #ecf0f1; padding: 15px; border-radius: 5px;">
//                 <strong>🚪 Entry/Exit Count:</strong><br>
//                 ➡️ Total In: ${data.total_in}<br>
//                 ⬅️ Total Out: ${data.total_out}
//               </div>
//             </div>
//           </div>

//           <div style="margin-bottom: 30px;">
//             <h3 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px;">🪑 Table Status</h3>
//             <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
//               <thead>
//                 <tr style="background-color: #3498db; color: white;">
//                   <th style="padding: 12px; border: 1px solid #ddd;">Table</th>
//                   <th style="padding: 12px; border: 1px solid #ddd;">Status</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 ${tableStatusHtml}
//               </tbody>
//             </table>
//           </div>

//           <div style="text-align: center; padding-top: 20px; border-top: 1px solid #ecf0f1; color: #95a5a6; font-size: 12px;">
//             <p>This is an automated report sent every 2 minutes.</p>
//             <p>Store ID: ${
//               data.store_id
//             } | Report Time: ${new Date().toLocaleString("en-IN", {
//       timeZone: "Asia/Kolkata",
//     })}</p>
//           </div>
//         </div>
//       </div>
//     `;

//     const text = `
// KALKAJI STORE OCCUPANCY REPORT
// ==============================

// 📊 CURRENT OCCUPANCY: ${data.inside} people inside
// 📈 TABLE OCCUPANCY: ${occupancyRate}% (${occupiedTables}/${totalTables} tables occupied)

// DETAILED STATISTICS:
// 👨 Male Count: ${data.male_count}
// 👩 Female Count: ${data.female_count}
// ➡️ Total In: ${data.total_in}
// ⬅️ Total Out: ${data.total_out}

// TABLE STATUS:
// ${Object.entries(data.tables || {})
//   .map(([table, status]) => `${table}: ${status}`)
//   .join("\n")}

// Last Updated: ${timestamp}
// Report Generated: ${new Date().toLocaleString("en-IN", {
//       timeZone: "Asia/Kolkata",
//     })}
//     `;

//     return { subject, html, text };
//   }

//   // Function to send email
//   async sendEmail(data) {
//     try {
//       const emailContent = this.formatDataForEmail(data);

//       const mailOptions = {
//         from: {
//           name: "Kalkaji Store Monitoring",
//           address: process.env.EMAIL_USER,
//         },
//         to: "krishna@hivoco.com",
//         subject: emailContent.subject,
//         html: emailContent.html,
//         text: emailContent.text,
//       };

//       const info = await this.transporter.sendMail(mailOptions);
//       console.log(
//         `📧 [${new Date().toISOString()}] Email sent successfully:`,
//         info.messageId
//       );
//       return true;
//     } catch (error) {
//       console.error(
//         `❌ [${new Date().toISOString()}] Email sending failed:`,
//         error.message
//       );
//       return false;
//     }
//   }

//   // Main email job function
//   async runEmailJob() {
//     console.log(`🔄 [${new Date().toISOString()}] Running email job...`);

//     try {
//       const storeData = await this.fetchStoreData();
//       const emailSent = await this.sendEmail(storeData);

//       if (emailSent) {
//         console.log(
//           `✅ [${new Date().toISOString()}] Email job completed successfully`
//         );
//       } else {
//         console.log(
//           `⚠️ [${new Date().toISOString()}] Email job completed with errors`
//         );
//       }
//     } catch (error) {
//       console.error(
//         `❌ [${new Date().toISOString()}] Email job failed:`,
//         error.message
//       );
//     }
//   }

//   // Start the cron job
//   start() {
//     if (this.isRunning) {
//       console.log("⚠️ Email cron job is already running");
//       return;
//     }

//     console.log("🚀 Starting Email Cron Job...");
//     console.log("📧 Emails will be sent to: krishna@gmail.com");
//     console.log("⏰ Job will run every 2 minutes");

//     // Schedule the cron job - runs every 2 minutes
//     this.cronJob = cron.schedule(
//       "*/2 * * * *",
//       () => {
//         this.runEmailJob();
//       },
//       {
//         scheduled: true,
//         timezone: "Asia/Kolkata",
//       }
//     );

//     this.isRunning = true;
//     console.log("✅ Email cron job started successfully");

//     // Run immediately for testing
//     console.log("🧪 Sending initial test email...");
//     this.runEmailJob();
//   }

//   // Stop the cron job
//   stop() {
//     if (this.cronJob) {
//       this.cronJob.destroy();
//       this.cronJob = null;
//       this.isRunning = false;
//       console.log("🛑 Email cron job stopped");
//     }
//   }

//   // Check if cron job is running
//   isActive() {
//     return this.isRunning;
//   }

//   // Test email configuration
//   async testEmailConfig() {
//     try {
//       await this.transporter.verify();
//       console.log("✅ Email configuration verified successfully");
//       return true;
//     } catch (error) {
//       console.error("❌ Email configuration error:", error.message);
//       return false;
//     }
//   }
// }

// // Export the service class
// export default EmailCronService;

// src/config/emailcron.js - Enhanced UI Version
import mongoose from "mongoose";
import dotenv from "dotenv";
import cron from "node-cron";
import nodemailer from "nodemailer";

dotenv.config();

class EmailCronService {
  constructor() {
    this.cronJob = null;
    this.transporter = null;
    this.isRunning = false;
    this.initializeEmailTransporter();
  }

  // Initialize email transporter
  initializeEmailTransporter() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || "smtp.gmail.com",
      port: process.env.EMAIL_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  // Function to fetch data from MongoDB
  async fetchStoreData() {
    try {
      if (mongoose.connection.readyState !== 1) {
        await mongoose.connect(process.env.MONGOOSE_URI);
      }

      const storeData = await mongoose.connection.db
        .collection("in_person_count")
        .findOne({ store_id: "kalkaji" });

      console.log(`📦 [${new Date().toISOString()}] Email Cron - Data fetched`);
      return storeData;
    } catch (err) {
      console.error(
        `❌ [${new Date().toISOString()}] Email Cron - MongoDB Error:`,
        err.message
      );
      throw err;
    }
  }

  // Enhanced function to format data for email with beautiful UI
  formatDataForEmail(data) {
    if (!data) {
      return {
        subject: "🚨 Kalkaji Store Data - No Data Available",
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 650px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px;">
            <div style="background: white; padding: 40px; border-radius: 20px; box-shadow: 0 20px 40px rgba(0,0,0,0.1);">
              <div style="text-align: center; margin-bottom: 30px;">
                <div style="background: #e74c3c; color: white; width: 80px; height: 80px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 36px; margin-bottom: 20px;">⚠️</div>
                <h2 style="color: #e74c3c; margin: 0; font-size: 28px;">Alert: No Data Available</h2>
              </div>
              <p style="color: #555; font-size: 16px; line-height: 1.6; text-align: center;">No data was found for Kalkaji store at ${new Date().toLocaleString()}.</p>
              <p style="color: #555; font-size: 16px; line-height: 1.6; text-align: center;">Please check the system status.</p>
            </div>
          </div>
        `,
        text: `Alert: No data available for Kalkaji store at ${new Date().toLocaleString()}.`,
      };
    }

    // Calculate occupancy percentage
    const totalTables = Object.keys(data.tables || {}).length;
    const occupiedTables = Object.values(data.tables || {}).filter(
      (status) => status === "Occupied"
    ).length;
    const occupancyRate =
      totalTables > 0 ? ((occupiedTables / totalTables) * 100).toFixed(1) : 0;

    const getStatusColor = (inside) => {
      if (inside === 0) return "#95a5a6";
      if (inside <= 10) return "#27ae60";
      if (inside <= 20) return "#f39c12";
      return "#e74c3c";
    };

    const getStatusGradient = (inside) => {
      if (inside === 0) return "linear-gradient(135deg, #bdc3c7 0%, #95a5a6 100%)";
      if (inside <= 10) return "linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)";
      if (inside <= 20) return "linear-gradient(135deg, #f1c40f 0%, #f39c12 100%)";
      return "linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)";
    };

    const statusColor = getStatusColor(data.inside);
    const statusGradient = getStatusGradient(data.inside);
    
    const timestamp = new Date(data.last_updated).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const tableStatusHtml = Object.entries(data.tables || {})
      .map(([table, status]) => {
        const statusIcon = status === "Occupied" ? "🔴" : "🟢";
        const rowColor = status === "Occupied" ? "#fff5f5" : "#f0fff4";
        const textColor = status === "Occupied" ? "#e74c3c" : "#27ae60";
        return `
          <tr style="background-color: ${rowColor}; transition: all 0.3s ease;">
            <td style="padding: 16px 20px; border: none; font-weight: 600; color: #2c3e50; border-radius: 8px 0 0 8px;">${table}</td>
            <td style="padding: 16px 20px; border: none; color: ${textColor}; font-weight: 600; text-align: center; border-radius: 0 8px 8px 0;">
              <span style="background: ${textColor}; color: white; padding: 6px 12px; border-radius: 20px; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">
                ${statusIcon} ${status}
              </span>
            </td>
          </tr>
          <tr><td colspan="2" style="height: 8px;"></td></tr>
        `;
      })
      .join("");

    const subject = `📊 Kalkaji Store Report - ${data.inside} People Inside | ${occupancyRate}% Table Occupancy`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Kalkaji Store Report</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, sans-serif;">
        
        <!-- Main Container Table -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f4f4f4; padding: 20px;">
          <tr>
            <td align="center">
              
              <!-- Email Content Table -->
              <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: white; max-width: 600px;">
                
                <!-- Header Section -->
                <tr>
                  <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); background-color: #667eea; padding: 40px; text-align: center;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td align="center">
                          <div style="font-size: 48px; margin-bottom: 20px;">🏪</div>
                          <h1 style="color: white; margin: 0; font-size: 32px; font-weight: bold; margin-bottom: 10px;">
                            Kalkaji Store Report
                          </h1>
                          <p style="color: rgba(255,255,255,0.9); margin: 0; font-size: 18px; margin-bottom: 20px;">
                            Real-time Occupancy Dashboard
                          </p>
                          <p style="color: white; font-size: 14px; margin: 0;">
                            📅 Last Updated: ${timestamp}
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Key Metrics Section -->
                <tr>
                  <td style="padding: 40px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td align="center" style="padding-bottom: 30px;">
                          <h2 style="color: #2c3e50; font-size: 24px; margin: 0; margin-bottom: 20px;">📊 Key Metrics</h2>
                        </td>
                      </tr>
                      <tr>
                        <!-- People Inside Metric -->
                        <td width="50%" align="center" style="padding: 20px;">
                          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: ${statusColor}; border-radius: 10px;">
                            <tr>
                              <td style="padding: 30px; text-align: center;">
                                <div style="color: white; font-size: 48px; font-weight: bold; margin-bottom: 10px;">
                                  ${data.inside}
                                </div>
                                <div style="color: white; font-size: 16px; font-weight: bold; text-transform: uppercase;">
                                  People Inside
                                </div>
                              </td>
                            </tr>
                          </table>
                        </td>
                        <!-- Table Occupancy Metric -->
                        <td width="50%" align="center" style="padding: 20px;">
                          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #3498db; border-radius: 10px;">
                            <tr>
                              <td style="padding: 30px; text-align: center;">
                                <div style="color: white; font-size: 48px; font-weight: bold; margin-bottom: 10px;">
                                  ${occupancyRate}%
                                </div>
                                <div style="color: white; font-size: 16px; font-weight: bold; text-transform: uppercase;">
                                  Table Occupancy
                                </div>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Detailed Statistics Section -->
                <tr>
                  <td style="padding: 0 40px 40px 40px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td align="center" style="padding-bottom: 30px;">
                          <h3 style="color: #2c3e50; font-size: 20px; margin: 0;">📈 Detailed Statistics</h3>
                        </td>
                      </tr>
                      <tr>
                        <!-- Gender Breakdown -->
                        <td width="50%" style="padding-right: 15px;">
                          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #ff9a9e; border-radius: 10px;">
                            <tr>
                              <td style="padding: 25px;">
                                <h4 style="color: white; margin: 0; font-size: 18px; margin-bottom: 15px;">
                                  👥 Gender Breakdown
                                </h4>
                                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="color: white; font-size: 16px;">
                                  <tr>
                                    <td>👨 Male:</td>
                                    <td align="right" style="font-weight: bold;">${data.male_count}</td>
                                  </tr>
                                  <tr style="height: 10px;"><td colspan="2"></td></tr>
                                  <tr>
                                    <td>👩 Female:</td>
                                    <td align="right" style="font-weight: bold;">${data.female_count}</td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>
                        </td>
                        <!-- Entry/Exit Count -->
                        <td width="50%" style="padding-left: 15px;">
                          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #a8edea; border-radius: 10px;">
                            <tr>
                              <td style="padding: 25px;">
                                <h4 style="color: #2c3e50; margin: 0; font-size: 18px; margin-bottom: 15px;">
                                  🚪 Entry/Exit Count
                                </h4>
                                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="color: #2c3e50; font-size: 16px;">
                                  <tr>
                                    <td>➡️ Total In:</td>
                                    <td align="right" style="font-weight: bold; color: #27ae60;">${data.total_in}</td>
                                  </tr>
                                  <tr style="height: 10px;"><td colspan="2"></td></tr>
                                  <tr>
                                    <td>⬅️ Total Out:</td>
                                    <td align="right" style="font-weight: bold; color: #e74c3c;">${data.total_out}</td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Table Status Section -->
                <tr>
                  <td style="padding: 0 40px 40px 40px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td align="center" style="padding-bottom: 30px;">
                          <h3 style="color: #2c3e50; font-size: 20px; margin: 0;">🪑 Table Status Overview</h3>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <!-- Table Status Table -->
                          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8f9fa; border-radius: 10px;">
                            <tr>
                              <td style="padding: 20px;">
                                <table width="100%" cellpadding="0" cellspacing="0" border="1" style="border-collapse: collapse; border: 1px solid #dee2e6;">
                                  <!-- Table Header -->
                                  <tr style="background-color: #667eea;">
                                    <th style="color: white; padding: 15px; text-align: left; font-size: 16px; font-weight: bold; border: 1px solid #dee2e6;">
                                      TABLE
                                    </th>
                                    <th style="color: white; padding: 15px; text-align: center; font-size: 16px; font-weight: bold; border: 1px solid #dee2e6;">
                                      STATUS
                                    </th>
                                  </tr>
                                  <!-- Table Rows -->
                                  ${Object.entries(data.tables || {}).map(([table, status]) => {
                                    const statusIcon = status === "Occupied" ? "🔴" : "🟢";
                                    const rowColor = status === "Occupied" ? "#fff5f5" : "#f0fff4";
                                    const textColor = status === "Occupied" ? "#e74c3c" : "#27ae60";
                                    return `
                                      <tr style="background-color: ${rowColor};">
                                        <td style="padding: 12px 15px; font-weight: bold; color: #2c3e50; border: 1px solid #dee2e6;">
                                          ${table}
                                        </td>
                                        <td style="padding: 12px 15px; text-align: center; color: ${textColor}; font-weight: bold; border: 1px solid #dee2e6;">
                                          ${statusIcon} ${status}
                                        </td>
                                      </tr>
                                    `;
                                  }).join("")}
                                </table>
                                
                                <!-- Summary -->
                                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 20px; background-color: #667eea; border-radius: 8px;">
                                  <tr>
                                    <td style="padding: 15px; text-align: center;">
                                      <span style="color: white; font-size: 16px; font-weight: bold;">
                                        📊 ${occupiedTables} out of ${totalTables} tables currently occupied
                                      </span>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Footer Section -->
                <tr>
                  <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #dee2e6;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td align="center">
                          <p style="background-color: #667eea; color: white; padding: 8px 16px; border-radius: 20px; font-size: 12px; text-transform: uppercase; font-weight: bold; margin: 0 auto; display: inline-block; margin-bottom: 15px;">
                            🤖 Automated Report
                          </p>
                          <p style="color: #6c757d; margin: 10px 0 5px 0; font-size: 14px;">
                            This report is automatically generated every 2 minutes
                          </p>
                          <p style="color: #6c757d; margin: 5px 0 0 0; font-size: 12px;">
                            Store ID: <strong>${data.store_id}</strong> | Generated: ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

              </table>
              
              <!-- Powered by -->
              <table width="600" cellpadding="0" cellspacing="0" border="0" style="margin-top: 20px;">
                <tr>
                  <td align="center">
                    <p style="color: #666; font-size: 12px; margin: 0;">
                      Powered by HiVoco Store Monitoring System
                    </p>
                  </td>
                </tr>
              </table>
              
            </td>
          </tr>
        </table>

      </body>
      </html>
    `;

    const text = `
🏪 KALKAJI STORE OCCUPANCY REPORT
===============================================

⏰ REPORT TIME: ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}
📅 LAST UPDATED: ${timestamp}

📊 KEY METRICS:
├─ Current Occupancy: ${data.inside} people inside
├─ Table Occupancy: ${occupancyRate}% (${occupiedTables}/${totalTables} tables)
├─ Male Count: ${data.male_count}
├─ Female Count: ${data.female_count}
├─ Total In: ${data.total_in}
└─ Total Out: ${data.total_out}

🪑 TABLE STATUS:
${Object.entries(data.tables || {}).map(([table, status], index, arr) => 
  `${index === arr.length - 1 ? '└─' : '├─'} ${table}: ${status === 'Occupied' ? '🔴' : '🟢'} ${status}`
).join('\n')}

===============================================
Store ID: ${data.store_id}
This is an automated report sent every 2 minutes.
    `;

    return { subject, html, text };
  }

  // Function to send email
  async sendEmail(data) {
    try {
      const emailContent = this.formatDataForEmail(data);

      const mailOptions = {
        from: {
          name: "Kalkaji Store Monitoring",
          address: process.env.EMAIL_USER,
        },
        to: "pritesh@hivoco.com",
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log(
        `📧 [${new Date().toISOString()}] Email sent successfully:`,
        info.messageId
      );
      return true;
    } catch (error) {
      console.error(
        `❌ [${new Date().toISOString()}] Email sending failed:`,
        error.message
      );
      return false;
    }
  }

  // Main email job function
  async runEmailJob() {
    console.log(`🔄 [${new Date().toISOString()}] Running email job...`);

    try {
      const storeData = await this.fetchStoreData();
      const emailSent = await this.sendEmail(storeData);

      if (emailSent) {
        console.log(
          `✅ [${new Date().toISOString()}] Email job completed successfully`
        );
      } else {
        console.log(
          `⚠️ [${new Date().toISOString()}] Email job completed with errors`
        );
      }
    } catch (error) {
      console.error(
        `❌ [${new Date().toISOString()}] Email job failed:`,
        error.message
      );
    }
  }

  // Start the cron job
  start() {
    if (this.isRunning) {
      console.log("⚠️ Email cron job is already running");
      return;
    }

    console.log("🚀 Starting Email Cron Job...");
    console.log("📧 Emails will be sent to: krishna@hivoco.com");
    console.log("⏰ Job will run every 2 minutes");

    // Schedule the cron job - runs every 2 minutes
    this.cronJob = cron.schedule(
      "0 * * * *",
      () => {
        this.runEmailJob();
      },
      {
        scheduled: true,
        timezone: "Asia/Kolkata",
      }
    );

    this.isRunning = true;
    console.log("✅ Email cron job started successfully");

    // Run immediately for testing
    console.log("🧪 Sending initial test email...");
    this.runEmailJob();
  }

  // Stop the cron job
  stop() {
    if (this.cronJob) {
      this.cronJob.destroy();
      this.cronJob = null;
      this.isRunning = false;
      console.log("🛑 Email cron job stopped");
    }
  }

  // Check if cron job is running
  isActive() {
    return this.isRunning;
  }

  // Test email configuration
  async testEmailConfig() {
    try {
      await this.transporter.verify();
      console.log("✅ Email configuration verified successfully");
      return true;
    } catch (error) {
      console.error("❌ Email configuration error:", error.message);
      return false;
    }
  }
}

// Export the service class
export default EmailCronService;