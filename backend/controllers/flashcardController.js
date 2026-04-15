import Flashcard from "../models/Flashcard.js";

//@desc Tải tất cả flashcard của tài liệu
// @route GET /api/flashcards/:documentId
// @access Private
export const getFlashcards = async (req, res, next) => {
    try{
        const flashcards = await Flashcard.find({
            userId: req.user._id,
            documentId: req.params.documentId
        })
        
        .populate('documentId', 'title fileName')
        .sort({ createAt: -1});

        res.status(200).json({
            success: true,
            count: flashcards.length,
            data: flashcards
        });

    }catch(error) {
        next(error);
    }
};

//@desc Tải tất cả bộ flashcard cho người dùng
// @route GET /api/flashcards
// @access Private
export const getAllFlashcardSets = async (req, res, next) => {
    try{
        const flashcardSets = await Flashcard.find({ userId: req.user._id})
            .populate('documentId', 'title')
            .sort({ createAt: -1 });
    
        res.status(200).json({
            success: true,
            count: flashcardSets.length,
            data: flashcardSets,
        });
    }catch(error) {
        next(error);
    }
};

//@desc Đánh dấu đã xem lại flashcard
// @route POST /api/flashcards/:cardId/review
// @access Private
export const reviewFlashcard = async (req, res, next) => {
    try{
        const flashcardSet = await Flashcard.findOne({
            'cards._id': req.params.cardId,
            userId: req.user._id
        });

        if(!flashcardSet) {
            return res.status(404).json({
                success: false,
                error: 'Không tìm thấy bộ hoặc thẻ flashcard',
                statusCode: 404
            });
        }

        const cardIndex = flashcardSet.cards.findIndex(card => card._id.toString()=== req.params.cardId);

        if (cardIndex === -1){
            return res.status(404).json({
                success: false,
                error:'Không tìm thấy thẻ trong bộ',
                statusCode: 404
            });
        }

        //Cập nhật thông tin xem lại
        flashcardSet.cards[cardIndex].lastReviewed = new Date();
        flashcardSet.cards[cardIndex].reviewCount += 1;

        await flashcardSet.save();

        res.status(200).json({
            success: true,
            data: flashcardSet,
            message:'Flashcard đã được đánh dấu là đã xem lại'
        });
    }catch(error) {
        next(error);
    }
};

//@desc Đánh dấu yêu thích flashcard
// @route PUT /api/flashcards/:cardId/star
// @access Private
export const toggleStarFlashcard = async (req, res, next) => {
    try{
        const flashcardSet =await Flashcard.findOne({
            'cards._id': req.params.cardId,
            userId: req.user._id
        });

        if(!flashcardSet) {
            return res.status(404).json({
                success: false,
                error: 'Không tìm thấy bộ hoặc thẻ flashcard',
                statusCode: 404
            });
        }

        const cardIndex= flashcardSet.cards.findIndex(card => card._id.toString() === req.params.cardId);
        
        if (cardIndex === -1){
            return res.status(404).json({
                success: false,
                error: 'Không tìm được thẻ trong bộ flashcard '
            }); 
        }
        
        //ToggleStar
        flashcardSet.cards[cardIndex].isStarred = !flashcardSet.cards[cardIndex].isStarred;

        await flashcardSet.save();

        res.status(200).json({
            success: true,
            data: flashcardSet,
            message: `Flashcard ${flashcardSet.cards[cardIndex].isStarred ?'starred' : 'unstarred'}`
        });
    }catch(error) { 
        next(error);
    }
};

//@desc Xóa bộ flashcard
// @route DELETE /api/flashcards/:id
// @access Private
export const deleteFlashcardSet = async (req, res, next) => {
    try{
        const flashcardSet = await Flashcard.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if(!flashcardSet) {
            return res.status(404).json({
                success: false,
                error: 'Không tìm thấy bộ flashcard',
                statusCode: 404
            });
        }

        await flashcardSet.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Đã xóa bộ flashcard thành công'
        });
    }catch(error) {
        next(error);
    }
};






