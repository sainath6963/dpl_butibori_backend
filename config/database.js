import mongoose from 'mongoose';

const connectDatabase = async () => {
    try {
        // Check both possible variable names
        const mongoUri = process.env.MONGODB_URI || process.env.MONGODB_URL;
        
        if (!mongoUri) {
            throw new Error('MONGODB_URI or MONGODB_URL is not defined in environment variables');
        }

        console.log('Connecting to MongoDB...');
        // Hide credentials in log
        const sanitizedUri = mongoUri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@');
        console.log('MongoDB URI:', sanitizedUri);
        
        // Remove deprecated options - they're not needed in Mongoose 6+
        const conn = await mongoose.connect(mongoUri);
        
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        console.log(`✅ Database Name: ${conn.connection.name}`);
        
        // Handle connection events
        mongoose.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected');
        });

        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            console.log('MongoDB connection closed through app termination');
            process.exit(0);
        });
        
    } catch (error) {
        console.error('❌ MongoDB Connection Error:', error.message);
        console.error('\nTroubleshooting tips:');
        console.error('1. Check your internet connection');
        console.error('2. Verify MongoDB Atlas IP whitelist includes your current IP');
        console.error('3. Confirm database username and password are correct');
        console.error('4. Make sure the database name is included in the URI');
        console.error('5. Try connecting with MongoDB Compass to test credentials');
        process.exit(1);
    }
};

export default connectDatabase;